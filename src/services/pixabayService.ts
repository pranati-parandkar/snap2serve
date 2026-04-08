const PIXABAY_API_KEY = (import.meta as any).env.VITE_PIXABAY_API_KEY;

export async function fetchRecipeImage(query: string): Promise<string | undefined> {
  if (!PIXABAY_API_KEY) {
    console.warn('Pixabay API key is missing. Using fallback image.');
    return undefined;
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
        query
      )}&image_type=photo&category=food&orientation=horizontal&per_page=3`
    );

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.hits && data.hits.length > 0) {
      // Return the largeImageURL or webformatURL
      return data.hits[0].webformatURL;
    }
    
    // If no results for the specific query, try a more general one
    if (query.split(' ').length > 1) {
      const generalQuery = query.split(' ').slice(-2).join(' ');
      const fallbackResponse = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
          generalQuery
        )}&image_type=photo&category=food&orientation=horizontal&per_page=3`
      );
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.hits && fallbackData.hits.length > 0) {
        return fallbackData.hits[0].webformatURL;
      }
    }

    return undefined;
  } catch (error) {
    console.error('Error fetching image from Pixabay:', error);
    return undefined;
  }
}