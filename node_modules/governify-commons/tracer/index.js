
const { trace, context } = require("@opentelemetry/api");
const { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { AsyncHooksContextManager } = require("@opentelemetry/context-async-hooks")

let contextManager = new AsyncHooksContextManager();
contextManager.enable();
context.setGlobalContextManager(contextManager);
const provider = new BasicTracerProvider();
provider.register();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
trace.setGlobalTracerProvider(provider);
const tracer = trace.getTracer("Commons-Tracer", "0.1.0");

module.exports.middlewareTracer = async function (req, res, next) {
  const span = tracer.startSpan("HTTPRequestSpan", {}, context.active());
  const contextWithSpan = trace.setSpan(context.active(), span)
  //Call the next function in the context
  context.with(contextWithSpan, next);
}

module.exports.getCurrentTraceId = function () {
  let traceId;
  try {
    traceId = context.active()._currentContext.values().next().value._spanContext.traceId;
  } catch (err) {
    traceId = "NOTRACE"
  }
  return traceId;
}

module.exports.getCurrentTraceShortId = function () {
  return this.getCurrentTraceId() && this.getCurrentTraceId().substring(0, 5);
}