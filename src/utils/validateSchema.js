export const validateJoiSchema = ({ schema, data }) => {
  const { error } = schema.validate(data);

  if (error) {
    return error.message;
  }
  return null;
};
