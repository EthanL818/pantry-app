# RecipeCrafter

RecipeCrafter is a web application that helps you manage your pantry and generate recipes based on the ingredients you have on hand. With RecipeCrafter, you can easily keep track of your pantry items and get creative recipe ideas tailored to your available ingredients and preferences.

## Features

- **Pantry Management**: Add, edit, and remove items from your digital pantry.
- **Recipe Generation**: Generate recipes based on your pantry items and additional preferences.
- **User Authentication**: Secure user accounts with Firebase authentication.
- **Responsive Design**: Built with Material-UI for a clean, modern, and mobile-friendly interface.
- **Image Integration**: Automatically fetch and display images for pantry items.

## Technologies Used

- Next.js
- React
- Firebase (Firestore for database, Authentication)
- Material-UI
- React Markdown

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/recipecrafter.git
   ```

2. Install dependencies:
   ```
   cd recipecrafter
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Firestore and Authentication services
   - Add your Firebase configuration to the project

4. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration and any other necessary API keys

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Sign up or log in to your account.
2. Add items to your pantry using the "Add Item" button.
3. Edit or remove pantry items as needed.
4. Click "Generate Recipe" to get a recipe based on your pantry items.
5. Add any additional preferences or dietary restrictions when prompted.
6. View, copy, or save the generated recipe.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Material-UI](https://material-ui.com/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
