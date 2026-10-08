const validate = (schema, source = 'body', target = source) => (request, _response, next) => {
  const result = schema.safeParse(request[source]);

  if (!result.success) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.details = result.error.flatten().fieldErrors;
    return next(error);
  }

  request[target] = result.data;
  return next();
};

module.exports = validate;
