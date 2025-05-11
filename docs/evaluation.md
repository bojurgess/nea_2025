# Evaluation

## Explanation of Objectives

Overall, I feel that the solution I have created has been completed to a high standard, and that I have managed to integrate all of the objectives outlined in my analysis to at least **some** degree of success. While I feel that I have fallen short in some areas of my solution, overall the system is responsive, easy to use and provides an interface for more complex and detailed analysis of a player's game data than is available either in game or in the other software solutions that existed at the time of me implementing my system.

I strongly believe that the underlying architecture and core components of the system, with my choice of technologies in that of a rust desktop app, a RESTful application architecture, realtional database model, JSON Web Token Authentication and Server Sent Events have created a robust, performant and easy to maintain application which is fault tolerant.

One of the main areas of success in the development of the program has been the realtime event streaming system, which makes the program feel more responsive and reduces the friction between the user and the system. This is due to the fact that the user doesn't have to refresh the page to see updates and provides almost instantaneous feedback on the user's in-game actions (e.g. completing a lap). This also allowed the derived metrics such as theoretical best lap time and average lap time to update as well. I could have instead used a websockets system instead, however this seemed like overkill due to the fact that information only needed to be sent one way (server -> client), and using a websocket system would have required more active management of the connection (defining a more robust shape for responses, maintaining the connection with heartbeats etc.).

I am also particularly proud of the design and layout of my program, which I think was greatly aided by the use of libraries like Svelte and TailwindCSS, which allowed me to create more reusable, modular components for the program. The consistent visual style both looks great and makes it easier for users to process the presented information.

The decision to mostly rely on web technologies and architecture commonly seen in web development (HTML, CSS, JS, RESTful application design) allowed me to more quickly prototype and implement my ideas for the program, due to my strong familiarity with web technologies over other available solutions such as Windows Forms or WPF.

I think the weakest aspect of the program by far is the lack of any dedicated cross user comparison tools such as a rating system. This would have allowed users to more quickly and easily grasp their performance in relation to other users on the platform, which can be important in understanding what the user's own level of performance is. To implement this feature I would have had to have devised an algorithm which would take at least lap time data for all users as an input parameter in order to create a theoretical 'optimal' lap time and assess the delta of users from this time. Because I already use a RESTful API architecture and developed an event streaming system, it would be fairly trivial to implement the new algorithm into the program by exposing it on a private API endpoint, and making a request to it every time either a session ends or a lap is completed. This would then recalculate all user ratings and produce a new type of event, which would update any user ratings on pages where they are visible (e.g. a track leaderboard, users directory, profile page).

### Objective

The program should help the player improve

### Discussion

While in a broad sense I think it could be argued that the program does give a user the tools to improve by presenting more detailed statistics about their driving to them, but falls short on its overall objective because it does not provide the user with any specific goals for improvement or strategies/steps to carry out which can help them improve. It does not create personally tailored practice programmes and does not rate drivers based on more specific areas of driving.

---

### Objective

The program should present a visual representation of the Player’s telemetry data.

### Discussion

The program presents more basic information such as session metadata (start/end time, lap count etc.), lap times, sector times, assists used (and more) in a tabular form to give an easily understandable overview of this data across a longer session or across a user's account lifetime. More complex data points such as braking, throttle, gearing, steering and speed are presented visually through a series of graphs which can be overlayed between laps. A lap time series scatter graph is also provided with a regression line to show the user how their lap times progressed over the course of a session.

---

### Objective

The program should make observations from a large data set

### Discussion

The program successfully makes observations from a large dataset because it collects a significant amount of detailed information from the game's telemetry interface, at a high interval (60hz). This is collected over a series of laps ranging anywhere from 1 lap to potentially hundreds, and the program produces graphs for a good amount of these statistics. As well as this, more basic information is collected from the game's telemetry interface and presented in tables for the user to view.

The program analyzes a large dataset by leveraging the PostgreSQL database to store and query telemetry data efficiently. The telemetry data includes detailed information such as braking, throttle, and steering angle for each lap. By normalizing the database schema to the third normal form, the program ensures efficient data retrieval and analysis. Additionally, the program uses advanced SQL queries and built-in PostgreSQL features, such as JSONB data types, to process and extract meaningful insights from the data. These insights are then presented to the user through visualizations and reports, enabling them to identify patterns and improve their performance. However, the program could be further enhanced by incorporating machine learning techniques to automate the discovery of trends and anomalies in the dataset.

---

### Objective

The program should provide an interface for comparison between multiple players

### Discussion

The program has a webpage for each individual track, which contains a leaderboard that users can use to compare with each other. Users can then navigate to individual session pages where they can see how other players are performing at a higher level of detail. The solution fell slightly short of delivering on all aspects of this objective, as there is no way for users to directly overlay each other's graphs on each other.

### Objective

Create a web application which allows users to view their telemetry information

### Discussion

A web application was created which presents all of the available telemetry data to the user in an easily readable and accessible format. A user account system was created in the web application which allows a user to authenticate on several different machines if need be and access their data. The web application presents any updates in telemetry information to the user in realtime, and exposes a REST API which can be used to manually upload telemetry data in the correct format. This decouples the frontend for displaying information from the backend which collects telemetry data. This will allow the program to be easily updated to handle future installments of the game where the shape of telemetry data might change.

---

### Objective

Use a desktop app which users can use to collect game telemetry information

### Discussion

A desktop app was created which opens a UDP socket on a specified port, in order to recieve telemetry data from the game. It establishes a secure connection with the web application using a JWT based authentication system using a refresh/access token architecture. The app is performant and doesn't use much of the user's system resources, which is an important consideration as the user also has the game opened, and a resource intensive application could disrupt the performance of the game and subsequently the user's performance.

---

### Objective

Sensitive user information should be handled securely and give users a degree of control over their authentication credentials

### Discussion

All passwords stored in the database are hashed using a cryptographically secure hashing algorithm (argon2id), which means that user passwords will be safe in the event of the database becoming compromised. Web endpoints are HTTPS enabled, preventing MITM attacks. REST endpoints are guarded behind bearer auth which requires a JWT access token, meaning that bad actors are unable to submit data without authentication to create a denial of service attack, or fill the database, and cannot masquerade as other users in order to maliciously submit data. The use of a JWT based authentication system for the desktop paired with a refresh/access token architecture means that users can choose to rotate their tokens and invalidate any current desktop sessions if they so choose. This has the added benefit of not needing to pass a user's password between the desktop and web app, creating an added layer of security.

---

### Objective

Facilitate real time streaming of game events to the program

### Discussion

A combination of Server Sent Events (SSE) and PostgreSQL's LISTEN and NOTIFY helpers were used in order to create a system that would produce events whenever the desktop app POSTED or PUT data on the API, which could then be recieved by any subscribed clients (users on a webpage). The system is automatic and requires no user input to setup other than authenticating on the desktop app, and delivers events to users almost instantaneously (<1s and likely comfortably <200ms response times).

---

### Objective

The interface should be user friendly and easy to navigate

### Discussion

In order to make the user interface consistent and easy for users to navigate, I used the TailwindCSS library in conjunction with the Svelte frontend framework's component based architecture in order to create small, modular and reusable styles and markup which made the program clearer to use and ensured that the interface was unified across all screens of the app, including between the web and desktop app, which were both developed on top of the Svelte frontend framework.

---

### Objective

Use an SQL database to store telemetry and user data, including detailed telemetry information for each lap such as braking, throttle, steering angle etc.

### Description

---

A PostgreSQL database has been used in the solution in order to maintain a centralised store of all user and telemetry data. The database schema has been normalised to third normalised form and allows for easy and efficient querying due to the wide range of database libraries avaialable in javascript for PostgreSQL. PostgreSQL was chosen over other SQL RDBMS solutions such as MySQL or SQLite due to the fact that it has support for many useful builtin helper functions and data types, such as binary json (JSONB) data types and the NOTIFY and LISTEN helpers used to facilitate realtime event streaming. This was a great choice for modelling the various one to many relationships that exist in the model of the system.

## User Feedback

### Registering for an account / First steps

While everything loaded quickly and was very performant when trying to register for an account, the notification that popped up when I tried to use a weak password disappeared too quickly. I also thought that it needed to stand out more and wasn't very visible as I almost missed it completely the first time I tried to register. The colour probably needs to be changed to make it more visible. The notification also popped up again when I successfully registered, and this was confusing.

### Collecting Telemetry from the game

After signing up I was confused by the lack of any instructions or help, I was just taken to my profile page without being told what I needed to do next. It was very unintuitive and without being guided I would not have known to go to the settings page and generate a token. I think that there should have been some form of help or FAQ page that could be shown after somebody registers so that they know what to do next. The profile page saying something along the lines of "start driving to collect data" was misleading because it made it sound like all I had to do was open the game for it to work.

### Use in aiding in-game improvement

I feel like everything that I need to improve my pace and lap times is available for me to look at; everything is well laid out. I think that the graphs are the biggest tool introduced which isn't available in-game. In particular I think I would use it to look at where I feel the least consistent or slowest when I am driving, and try new things in the future to start comparing the differences.

It doesn't help me improve at other important aspects of racing such as tyre or fuel management though, which could have been done by adding more graphs for different kinds of data like tyre temperatures.

### User Interface / General Feedback

I like the animations on the buttons and the fde in and out on dropdowns. I ferel like there is a clear and distinct visual style which makes the app clearer and more easily traversable. Ilike that the top bar has everything I need to access on it, and I like that I can get ot the home screen by clicking the title button in the corner.

I like the use of tables and the highlighting of purple sectors/laps, because it makes it easier to see at a glance when I was the quickest. Putting some of the information in tables in general makes it easier to process the information and less overwhelming.

I like that there is an asterisk to highlight that invalid laps don't count in calculations, because I wouldn't have known otherwise and it would have made it more confusing if things didn't add up and ther was no disclaimer.

I think that the inclusion of flag icons is a neat addition and helps the visibility of tracks and users. Its easier to identify tracks from their flag than their name for me because images are more recognisable than text and stand out more.

I think that an autocomplete for the search feature or something that shows users that match while im typing it would be helpful, in case I didn't know the exact name of somebody that I'm trying to search for.

I don't like how the tracks listing page is laid out. The boxesx are not equal in size which appears untidy and leads to strange gaps which make it harder to read.

A picture of the track map would be useful alongside each track, to match up the graphs to specific corners on the circuit. Also, on the individual tracks page, it would be useful to have it there to identify the tracks more easily as well. For the same reasons that I like the inclusion of flags.

**Name:** Jack Burgess  
**Date:** 10/05/25  
**Signed:** J.Burgess

## Analysis of User Feedback

### Registering for an account / First steps

While the user's feedback on the performance of the registration process and pages was positive, they encountered readability issues with the presentation of errors through a toast notification. This led to confusion and required the user to submit the form several times in order to fully read the message being displayed. Visibility of the message was also a concern as the black and white box did not stand out well against the rest of the page. Making the error information stand out more against the rest of the page is a good change to the program which would be well recieved, as well as being an easy change to make.

### Collecting Telemetry from the game

Users were confused by the lack of instructions or help on how to start collecting telemetry from the game. The message presented on the profile page when there are no sessions led to further confusion as users believed that there were no additional steps required to start collecting telemetry data. Users had no idea that they had to go to the settings page in order to generate a login token for the desktop app. The addition of a help / faq page that could be navigated to after registration would have greatly benefited the understanding of users.

### Use in aiding in-game improvement

The inclusion of graphs were greatly appreciated by users who felt that it was a useful tool which is missing in the game itself. It gave the opportunity for users to try new things in-game to improve their time or consistency and give them additional context to their actions which could help them to improve.

One of the biggest potential additions in this area would be the inclusion of more data points on graphs which can help with improving different aspects of a user's driving. Right now, the program is mainly tailored to improving raw pace and lap time, and doesn't give much attention to things like tyre or fuel management.

### User Interface / General Feedback

While the overall sentiment regarding the user interface of the program was well recieved, with the styling of all elements and the addition of animations being particularly well recieved during feedback.

Users also liked the inclusion of flag icons alongside users and tracks to be a good addition, because it made these items easier to distinguish at a moments notice. However, this could have been further improved for tracks by including a track map, which would further differentiate each track card.

An appreciated, but minor addition to the program was the inclusion of an asterisk disclaimer on session pages, which alerted users that any invalid laps wouldn't be counted in calculations such as average lap time. This definitely worked to alleviate confusion and simplify the experience of using the app.

## Discussion of Improvements

### Possible Improvements

1. **User Guidance**

    - Add a help or FAQ page that is displayed after registration to guide users through the initial setup process, such as generating a token for the desktop app.
    - Improve the messaging on the profile page to clarify the steps required to start collecting telemetry data.
    - Would require the introduction of additional screens in order to implement. Would need thurough testing and feedback with users to ensure that the information provided is useful.

2. **More Visisble Error Notifications**

    - Use contrasting colors on the toast notifications and change their duration to hide only when dismissed by the user via a button.
    - Very minor fix that would not require significant effort or time investment

3. **Expanded Graph Features**

    - Include additional data points on graphs, such as tyre temperatures, fuel usage, and wear rates, to help users improve in areas beyond raw lap times, such as tyre and fuel management.
    - Add the ability to overlay graphs from multiple users for direct comparison.
    - Additional data points would likely be easy and quick to implement, but cross user graph comparison would require additional screens to be produced and lots of changes to the logic and design of current session elements (e.g. lap selection dropdown)

4. **Track and User Enhancements**

    - Include track maps alongside track cards and on individual track pages to help users better correlate telemetry data with specific corners or sections of the circuit.
    - Implement an autocomplete feature for the search bar to assist users in finding other players or tracks more easily.
    - A small improvement that would not be complex or take long to implement.

5. **Cross-User Comparison Tools**

    - Develop a rating system or algorithm to compare users' performance more effectively. This could include metrics like optimal lap time deltas or consistency scores.
    - Display these ratings on leaderboards and user profiles for better performance insights.
    - This is a significant addition that would likely require significant time investment

6. **UI and Layout Improvements**
    - Standardize the size of track cards on the tracks listing page to eliminate gaps and improve readability.
    - Refine the layout of pages to ensure a more polished and professional appearance.
