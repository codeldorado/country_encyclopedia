# Welcome to Country Encyclopedia App 👋

Country Encyclopedia is a mobile and web application built with React Native and Expo. This app allows users to explore detailed information about various countries, including population, area, languages, and neighboring countries. Users can also mark countries as favorites for quick access.

## Features

- **Country Details**: Browse a comprehensive list of countries and view details like population, area, and neighboring countries.
- **Search Functionality**: Search for countries by name or translations in various languages.
- **Favorites Management**: Mark and unmark countries as favorites, stored locally for quick access.
- **Caching**: Data is cached locally to reduce API calls and improve load times.
- **Pagination**: Infinite scrolling and lazy loading for a smoother user experience.

## Implementation Details

- **API Used**: [REST Countries API](https://restcountries.com/v3.1/all)
- **Implementation**
   - The app uses Axios to fetch data from the REST Countries API. On initial load, a GET request retrieves data for all countries and stores it locally in the app’s state.
   - **Caching**: The data is cached using AsyncStorage so that subsequent app loads can fetch data from local storage, reducing API calls and enhancing performance.

### Home Page
- **Lazy Loading and Virtualized Lists**: The home page list of countries is virtualized with FlatList for efficient scrolling and rendering.
- **Pagination and Infinite Scroll**: Data is loaded in chunks as the user scrolls to improve performance.
- The search input field filters countries by name or by available translations. This allows users to find countries based on various language translations (e.g., “Läti” for Latvia).
- The amount of data is small enough, so the debouncing is not implemented yet. 

### Country Details Page
The country details page provides in-depth information about each selected country.
- It shows each country's common name, official name, country Code, population, area and list of languages fetched from the related fields of the response.
- The country’s flag is displayed as an image. The flag URL is provided by the flags.png field from the API.
- To determine the country’s rank, the app sorts all countries by population. It then finds the index of the selected country within this sorted list.
This rank is recalculated on each detail view to ensure accuracy as data may change.
- To determine the country’s rank, the app sorts all countries by population. It then finds the index of the selected country within this sorted list.
This rank is recalculated on each detail view to ensure accuracy as data may change.
- The favorite/unfavorite functionality is implemented using a clickable icon. When clicked, the country is added to or removed from the list of favorites.<br>**Storage**: The list of favorites is managed through AsyncStorage, ensuring that favorites persist across app sessions.<br>
The app checks AsyncStorage on load to initialize the list of favorite countries, updating this list dynamically as users mark/unmark countries.

## Installation and running

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npm run start
   ```

Then, you'll see the project runnig on [https://localhost:8081](https://localhost:8081)

Leave a comment here for some enhancement, thanks!