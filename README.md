# devpost-backend

This README.md file provides instructions on how to download and run the MERN stack backend project locally.

## Prerequisites
Before proceeding, ensure that you have the following installed on your machine:
- Node.js: [Download and Install Node.js](https://nodejs.org/en/download/)

## Installation and Setup
1. Clone or download the repository from GitHub.
   - To clone the repository, open a terminal or command prompt and run the following command:
     ```
     git clone <repository_url>
     ```
   - Alternatively, you can download the repository as a ZIP file by clicking the "Download" button on the repository's GitHub page.

2. Navigate to the project directory.
   ```
   cd project-directory
   ```

3. Install the project dependencies using npm.
   ```
   npm install
   ```

4. Set up the environment variables.
   - The project may require certain environment variables to connect to the MongoDB Cloud. Contact the project maintainers to obtain the necessary credentials or configuration details.
   - Create a `.env` file in the project's root directory.
   - Add the required environment variables to the `.env` file. For example:
     ```
     MONGODB_URI=your_mongodb_uri
     PORT=8000
     JWT_SECRET=your_jwt_secret
     SALT=any_number
     REFRESH_TOKEN=your_refresh_token_from_googles_gmail_api
     CLIENT_ID= your_client_id_from_google_gmail_api
     CLIENT_SECRET= your_client_secret_from_google_gmail_api
     ```

## Running the Project
1. Start the backend server.
   ```
   npm start
   ```

2. The backend server should now be running. It will be accessible at `http://localhost:8000`.

## Testing the Project
To test the project, you can use tools like [Postman](https://www.postman.com/) or [curl](https://curl.se/). Send requests to the appropriate API endpoints to interact with the backend functionality.

## Troubleshooting
- If you encounter any errors during the installation or running of the project, ensure that you have met all the prerequisites and followed the installation steps correctly.
- Check the environment variables as they play a crucial part in the application.
  

## License
[MIT License](LICENSE)

## Acknowledgments
Mention any contributors, libraries, or other resources used in the project.
- [Library Name](https://example.com) - Description of the library.

## Support
For any questions or issues, please open an issue in the [GitHub repository](https://github.com/username/repository/issues).
