import sys, getopt, os
import csv, operator, copy
from datetime import datetime
from io import BytesIO
import base64, re, shutil
import matplotlib  
matplotlib.use('TkAgg')   
import matplotlib.pyplot as plt 
import matplotlib.dates as mdates

# -------------------------------
# Read file
# @inputFile: path file to read
# Return:
# - file headers list
# - file data grouped by the header
# -------------------------------
def readFile(inputFile):
    headers = []
    data = {}
    with open(inputFile, "r") as file:
        csv_reader = csv.reader(file)
        headers = next(csv_reader)

        for title in headers:
            data[title] = []
        for row in csv_reader:
            for i, title in enumerate(headers):
                data[title].append(row[i])
    
    return headers, data

# -------------------------------
# Read file
# @folderName: folder where is the result file csv
# @experimentNumber: number of the experiment to get results
# Return:
# - agreement dictionary. key: agreementId, value: header and data from the result file
# -------------------------------
def getResultsByAgreement(folderName, experimentNumber):
    agreements = {}
    excludes = '|'.join(['.DS_Store', '\w*_havest.csv','\w*joined.csv'])
    for root, dirs, files in os.walk(folderName):
        dirs[:] = [d for d in dirs if not re.match(excludes, d)]
        files = [f for f in files if not re.match(excludes, f)]
        for file in files:
            # TODO: filter files by the excludes list
            if "_harvest" not in file and "_joined" not in file and "html" not in file:
                agreementId = root.split('/')[-1:][0]
                
                pathFile = os.path.join(root, file)
                headers, data = readFile(pathFile)
                agreements[agreementId] = {
                    'headerFile' : headers,
                    'dataFile' : data
                }

    return agreements

# -------------------------------
# Read file
# @agreements: agreement dictionary
# Return:
# - Total number of ESC
# - All agreements joined in dictionary sorted by INIT_EXEC_TIME: 
#    key: timeStamp (INIT_EXEC_TIME), 
#    value: list with data for each agreement: escNumber, agreementId. totalTime, analysisTime, timeData, frequencyData
# -------------------------------
def joinResults(agreements):
    totalESC = len(agreements)
    result = {}
    for agreementId in agreements:
        escNumber = agreementId.split(agreementName)[1]
        dataFile = agreements[agreementId]['dataFile']
        for i in range(len(dataFile['INIT_EXEC_TIME'])):
            timeStamp = dataFile['INIT_EXEC_TIME'][i]
            currentTimestamp = []
            if timeStamp in result:
                currentTimestamp = result[timeStamp]
            newData = {
                'escNumber' : int(escNumber),
                'agreementId' : agreementId,
                'totalTime' : float(dataFile['TOTAL_TIME'][i]),
                'analysisTime' : float(dataFile['ANALYSIS_TIME'][i]),
                'timeData' : float(dataFile['TIME_DATA'][i]),
                'frequencyData' : float(dataFile['FREQUENCY_DATA'][i])
            }
            currentTimestamp.append(newData)
            result[timeStamp] = currentTimestamp

    keys = list(result.keys())
    keys.sort()
    sorted_result = {i: result[i] for i in keys}
    return totalESC, sorted_result

# -------------------------------
# Read file
# @totalNumberESC: Total number of ESC
# @agreementsJoined: All agreements joined in dictionary sorted by INIT_EXEC_TIME
# @savePath: Path where save the new file with joined agreements
# Return:
# - Full path of the new file created
# -------------------------------
def generateCSVJoined(totalNumberESC, agreementsJoined, savePath):
    header = ['TIMESTAMP']
    for i in range(totalNumberESC):
        escHeader = 'ESC_{0}_TotalTime,ESC_{0}_AnalysisTime,ESC_{0}_TimeData,ESC_{0}_FrequencyData'.format(i+1)
        header.extend(escHeader.split(','))

    now = datetime.now()
    now_str = now.strftime("%Y-%m-%dT%H-%M-%S")
    fileResultPath = savePath+now_str+'_joined.csv'

    keys = list(agreementsJoined.keys())
    keys.sort()
    with open(fileResultPath, 'w') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for timeStamp in keys:
            row = []
            dataTS = agreementsJoined[timeStamp]
            if totalNumberESC == len(dataTS):
                for agreement in dataTS:
                    row.append(agreement['totalTime'])
                    row.append(agreement['analysisTime'])
                    row.append(agreement['timeData'])
                    row.append(agreement['frequencyData'])
            else:
                existESC = []
                existingAgreement = {}
                for agreement in dataTS:
                    escNumber = agreement['escNumber']
                    existESC.append(escNumber)
                    agreementData = []
                    agreementData.append(agreement['totalTime'])
                    agreementData.append(agreement['analysisTime'])
                    agreementData.append(agreement['timeData'])
                    agreementData.append(agreement['frequencyData'])
                    existingAgreement[escNumber] = agreementData
                for i in range(totalNumberESC):
                    if i+1 in existESC:
                        row.extend(existingAgreement[i+1])
                    else:
                        row.extend([None,None,None,None])
            row.insert(0,timeStamp)
            writer.writerow(row)
    return fileResultPath

# -------------------------------
# Read file
# @agreementId: ESC Id
# @agreement: Agreement data
# Return:
# - Graphic image encoded in base64
# -------------------------------
def generateAgreementGraphic(agreementId, agreementObj):
    agreement = copy.deepcopy(agreementObj)
    data = agreement['dataFile']
    for i in range(len(data["INIT_EXEC_TIME"])):
        currentTimestamp = datetime.fromtimestamp(int(data["INIT_EXEC_TIME"][i])/1000)
        data["INIT_EXEC_TIME"][i] = currentTimestamp.strftime("%H:%M:%S")
    for i in range(len(data["TOTAL_TIME"])):
        data["TOTAL_TIME"][i] = float(data["TOTAL_TIME"][i])
    for i in range(len(data["FREQUENCY_DATA"])):
        data["FREQUENCY_DATA"][i] = float(data["FREQUENCY_DATA"][i])
    for i in range(len(data["MINIMUM_TIME"])):
        data["MINIMUM_TIME"][i] = float(data["MINIMUM_TIME"][i])
    for i in range(len(data["FREQUENCY_DATA"])):
        data["MAXIMUM_TIME"][i] = float(data["MAXIMUM_TIME"][i])
    for i in range(len(data["TIME_DATA"])):
        data["TIME_DATA"][i] = float(data["TIME_DATA"][i])

    fig, ax = plt.subplots()
    ax.bar(data["ID"], data["TOTAL_TIME"], align='center', label="Total time (s)", width=0.4, color='green')
    ax.plot(data["ID"], data["MINIMUM_TIME"], label="Min time (s)")
    ax.plot(data["ID"], data["MAXIMUM_TIME"], label="Max time (s)")
    ax.set_ylabel('Times (s)')
    ax.set_xlabel('Analysis Id') 

    ax2 = ax.twinx()
    color = 'red'
    label = 'Frequency (s)' if elasticityType == 'harvestFrequency' else 'Time Window (s)'
    yData = data["FREQUENCY_DATA"] if elasticityType == 'harvestFrequency' else data["TIME_DATA"]
    g4 = ax2.plot(data["ID"], yData, label=label, color=color)
    ax2.set_ylabel(label, color=color)
    ax2.tick_params(axis='y')

    ax.legend(loc="upper right")
    ax.title.set_text(agreementId)
    fig.autofmt_xdate()

    tmpfile = BytesIO()
    fig.savefig(tmpfile, format='png')
    encoded = base64.b64encode(tmpfile.getvalue()).decode('utf-8')
    return encoded

# -------------------------------
# Read file
# @numberESC: List with all base64 graphic images
# @keyGraphic: Element to measure in the axis y
# @dataJoined: Data from the joined agreements
# Return:
# - Graphic image encoded in base64
# -------------------------------
def generateComparativeGraphic(numberESC, agreementsList, keyGraphic):
    agreements = copy.deepcopy(agreementsList)
    keyGraphicAux = keyGraphic.replace(' ', '_').upper()
    availableMarkers = ['s','*','^','o','v','<','>','p','h','P','+','H','D','X','d','.']
    fig, ax = plt.subplots()
    counter = 0
    for agreementId in agreements:
        data = agreements[agreementId]['dataFile']
        for i in range(len(data["INIT_EXEC_TIME"])):
            currentTimestamp = datetime.fromtimestamp(int(data["INIT_EXEC_TIME"][i])/1000)
            #data["INIT_EXEC_TIME"][i] = currentTimestamp.strftime("%H:%M:%S")
            data["INIT_EXEC_TIME"][i] = currentTimestamp
        for i in range(len(data[keyGraphicAux])):
            data[keyGraphicAux][i] = float(data[keyGraphicAux][i])
        xTimes = matplotlib.dates.date2num((data["INIT_EXEC_TIME"]))
        marker = availableMarkers[counter]
        ax.scatter(xTimes, data[keyGraphicAux], marker = marker, label=agreementId)
        ax.plot(xTimes, data[keyGraphicAux])
        # Update counter for new marker
        counter = 0 if numberESC-1 == counter else counter + 1
    
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M:%S'))
    ax.legend(loc="upper right")
    ax.title.set_text("{} (s)".format(keyGraphic))
    fig.autofmt_xdate()

    tmpfile = BytesIO()
    fig.savefig(tmpfile, format='png')
    encoded = base64.b64encode(tmpfile.getvalue()).decode('utf-8')

    return encoded

# -------------------------------
# Read file
# @base64CodeLista: List with all base64 graphic images
# @file: File where to add graphics
# @replaceType: agreements | comparative
# -------------------------------
def addGraphics(base64CodeList, file, replaceType):
    if replaceType == 'agreements':
        toReplace = '<!--AgreementsChart-->'
        classDiv = 'col-4'
    elif replaceType == 'comparative':
        toReplace = '<!--JoinedChart-->'
        classDiv = 'col-6'
    
    elements = []
    for key in base64CodeList:
        base64graphic = base64CodeList[key]
        graphicElement = "<div class=\"{1}\"><img class=\"img-fluid\" src=\"data:image/png;base64,{0}\"></div>{2}".format(base64graphic,classDiv,toReplace)
        elements.append(graphicElement)
    newData = '<br/>'.join(elements)

    readFile = open(file, "r")
    data = readFile.read()
    data = data.replace(toReplace, newData)
    writeFile = open(file, "w")
    writeFile.write(data)


def main(argv):
    inputfolder = ''
    global experimentNumber
    global agreementName
    global elasticityType
    opts, args = getopt.getopt(argv,"h:e:a:t:",["expnum=","agreement=","elasticityType="])
    for opt, arg in opts:
        if opt == '-h':
            print ('printResults.py -e <experiment number>')
            sys.exit()
        elif opt in ("-e", "--expnum"):
            experimentNumber = arg
        elif opt in ("-a", "--agreement"):
            agreementName = arg
        elif opt in ("-t", "--elasticityType"):
            elasticityType = arg
    fullPath = os.path.dirname(os.path.abspath(__file__))
    pathFolder = fullPath + '/'+"experiments/runs/{0}/".format(experimentNumber)
    print('Experiment number: {0}\nAgreement: {2}\nPath folder: {1}'.format(experimentNumber, pathFolder, agreementName))

    # Dictionary. Key: agreement id; Value: {dataFile, headerFile}
    agreements = getResultsByAgreement(pathFolder, experimentNumber)
    # Join all agreements results by timestamp
    totalNumberESC, agreementsJoined = joinResults(agreements)
    # Create csv file with joined agreements
    joinedFilePath = generateCSVJoined(totalNumberESC, agreementsJoined, pathFolder)
    print('Agreements results joined in: {}'.format(joinedFilePath))
    # Copy template for graphics
    graphicPath = pathFolder + 'graphicResult.html'
    graphicTemplatePath = fullPath + '/graphicResultTemplate.html'
    shutil.copyfile(graphicTemplatePath, graphicPath)
    # Generate graphics in base64 for individual agreements
    agreementGraphic = {}
    for agreementId in agreements:
        base64graphic = generateAgreementGraphic(agreementId, agreements[agreementId])
        agreementGraphic[agreementId] = base64graphic
    # Add graphics to copied template
    addGraphics(agreementGraphic,graphicPath,'agreements')
    # Generate graphics in base64 for joined agreements
    comparativeGraphics = {}
    headersJoined, dataJoined = readFile(joinedFilePath)
    #keyGraphics = ['Total Time','Analysis Time', 'Time Data', 'Frequency Data']
    keyGraphics = ['Total Time','Time Data', 'Analysis Time', 'Frequency Data']
    for key in keyGraphics:
        base64graphicComparative = generateComparativeGraphic(totalNumberESC, agreements, key)
        comparativeGraphics[key] = base64graphicComparative
    # Add graphics to copied template
    addGraphics(comparativeGraphics,graphicPath,'comparative')
    print('You can view the graphic results in: {}'.format(graphicPath))

if __name__ == "__main__":
   main(sys.argv[1:])
