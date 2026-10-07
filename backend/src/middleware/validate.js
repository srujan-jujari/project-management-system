const validate = (schema) => (request, _response, next) => {
  const result = schema.safeParse(request.body);

  if (!result.success) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.details = result.error.flatten().fieldErrors;
    return next(error);
  }

  request.body = result.data;
  return next();
};

module.exports = validate;
