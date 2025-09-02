export const submitAnnotation = async (annotation) => {
  // In a real app, you'd send a POST request to your API.
  // For this mock, we'll just simulate an API call and log the data.
  console.log('Submitting annotation:', annotation);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate a successful response
  return { success: true, message: 'Annotation saved successfully.' };
};
