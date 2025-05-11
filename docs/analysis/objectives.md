# Objectives For The Proposed System

### Objective:

- The program should help the player improve

### Explanation

- The program should generate from telemetry data, areas which the player could improve on, providing personally-tailored practice programmes/tasks to facilitate this. Additionally, the program will provide individual driver ratings according to different categories and areas of skills, which can then be compared to themselves and others in order for players to be able to measure their performance and improvement.

---

### Objective

The program should present a visual representation of the Player’s telemetry data.

### Explanation

The program should generate graphs and charts of individual telemetry data points e.g. tyre wear, fuel levels, slip angle, slip ratio, braking, throttle etc.

---

### Objective

The program should make observations from a large data set

### Explanation

The program should collect as many relevant data points as possible provided by F1® 23’s telemetry output interface, and its processes should account for multiple inputs when running calculations. This should include data on the vehicle’s motion/position, lap and session information, weather and environment information and information on the car’s setup and status.

---

### Objective

The program should provide an interface for comparison between multiple players

### Explanation

The program should contain leaderboards for players to compare between, as well as include high level example data from players, so that the program may create comparisons between a player and an ‘optimal’ performance in order to generate analysis from. The program should also allow for the overlaying and direct comparison of player graphs for individual data points in addition to more simplified timing and rating leaderboards.

---

### Objective

Use an SQL database to store telemetry and user data, including detailed telemetry information for each lap such as braking, throttle, steering angle etc.

### Explanation

The program should make use of an SQL database in order to efficiently store a multitude of information required for the program to function. This will allow the program to draw data from the database in order to render in a user interface, and can be recalled in the long term should a user wish to analyse old laps.

---

### Objective

The interface should be user friendly and easy to navigate

### Explanation

One of the key issues with existing solutions is outdated and non-descriptive user interfaces that make it difficult for users to make sense of the data, and easily navigate to other areas of the program. The proposed solution should rectify this by using modern web technologies and clean CSS styling, and take careful consideration of the design/layout of the program to make the UX as pleasant as possible.

---

### Objective

Facilitate real time streaming of game events to the program

### Explanation

The program should implement a realtime events system which will allow users to recieve some form of instantaneous feedback from the program as new laps/sessions are driven. The program should not have to be refreshed in any way or require user input for this to happen.

---

### Objective

Sensitive user information should be handled securely and give users a degree of control over their authentication credentials

### Explanation

The program should hash all stored user passwords in the database, and should NOT use passwords to communicate between itself.

---

### Objective

Use a desktop app which users can use to collect game telemetry information

### Explanation

Because there is no way for a web application to open a UDP socket and communicate with the game to recieve telemetry data, a desktop app should instead be created that handles the collection and uploading of telemetry data to a seperate web application which displays the main program UI.

---

### Objective

Create a web application which allows users to view their telemetry information

### Explanation

A web application should be created to allow users to interact with the main aspects of the program and view their telemetry data, as this allows the data to be viewed from a broader range of devices than just computers.

---
