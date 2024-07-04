# xChat

A modern, real-time chat application built with React, NextUI and Firebase.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About

xChat is a real-time chat application designed for modern web communication. It leverages the power of React for the frontend and Firebase for the backend, ensuring a seamless and responsive user experience.

## Features

- Real-time messaging
- User authentication with Firebase
- Responsive design
- Emoji support
- User status indicators

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/AdamLam1/xChat.git
    cd xChat
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Add your Firebase configuration to firebase.jsx:
    ```
    REACT_APP_API_KEY=your_api_key
    REACT_APP_AUTH_DOMAIN=your_auth_domain
    REACT_APP_PROJECT_ID=your_project_id
    REACT_APP_STORAGE_BUCKET=your_storage_bucket
    REACT_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
    REACT_APP_APP_ID=your_app_id
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

## Usage

Once the server is running, open your browser and navigate to `http://localhost:3000` to start using xChat.

## Technologies

- **Frontend:** React, Tailwind CSS, NextUI
- **Backend:** Firebase (Firestore, Authentication)
- **Build Tool:** Vite


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

Created by [Adam Lam](https://github.com/AdamLam1) - feel free to contact me!
