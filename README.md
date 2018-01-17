# README #

Private repo for BitHatcher.

### What is this repository for? ###

* AngularJS with Ionic Framework

BitHatcher is an upcoming hybrid application, developed to be released for Android and iOS.

### Frequently updated with news regarding API and client side ###

## 2017-05-05 live update ##

In the last update I introduced a new feature. The battle-system. As with the completion of the coding for the feature I still felt that something was missing. Which was where I noticed a small failure in the idea. Let us assume that BitHatcher has only a few players, while the game is basically all about battling to gain resources to actually keep your pets alive. In this theory, there's only a small amount of player. Which is certainly an issue.

I played with the idea to implement a PvE option, which is in theory just a way for your pets to battle against a bot, or in this case a script. While building this idea to a product, which I'm doing right, I thought of the reality of this idea. It certainly seems okay. You can fight against a bot, and if you win you'll earn resources such as BitFunds, pets and food, but if you loose you might loose the pet.

This theory gives BitHatcher a chance to live without depending on having a lot of active users. Since the game is multiplayer by now.

## 2017-04-30 live update ##

Introducing a new feature with potential for BitHatcher, the battle-system. From the opinion of a couple of testers of the early access for the application, the first versions became boring. Most people enjoy games of winning, which introduced the idea of implementing battles.

Your project can now create a battle, which requires another project to sign up for it. The winner is mainly selected by the distinct stats of the projects. The project with the highest agility, strength, happiness and health have a higher chance of winning. The losing project will die meanwhile the winner will receive more resources to keep the project alive.

By introducing battles, a whole new view-point of the application has arrived. Instead of seeing it as just "taking care of pets" has now become a more challenging feature where you always have to keep the stats up and mostly battle to do so.

A great source of inspiration comes from Pokémon, but with a more challenging view-point implemented.

## 2017-03-29 live update ##

The beginning of the summer is approaching and I feel like I haven't written as much code for BitHatcher as I planned. Mostly due school work and freelance jobs. This update will remain as a quick instance of what I've done so far. I'll try to cover the most important parts as efficient as possible.

## User-interface ##

Let's start with the user-interface, which in my opinion is part where put the planning in work. I started with an idea, of releasing BitHatcher as a tamagotchi look-alike. Only for a trial run of proving my skills and of course the development of learning. I realised the bug opportunities I could grab into when I started the project by setting up the user-interface. There was so much more than just a tamagotchi look-alike. What ended up being processes of achievements, leveling, experience and much more. As I developed *Trivia Dash* which is a quiz game with similar leveling and achievement systems, I also realised the commitment of attachment for people. As an example, I'll use Facebook, the biggest social network "almost". Where people are obsessed of it. BitHatcher is almost the same, where you share your experience with another player.

I believe to where the applications design has gone, it's pretty good at the very moment. The idea was the pixelated feeling of the application. The easy interface of achievements, user resources, projects and more.

Moving on to the backend. While the logic of the application has improved quite over time. Modules, translation functions, and the standard "tamagotchi dying over time - if not fed" has as well improved by less lines of code.

## Token-exchange ##

Taking a look at the token-exchange modules where each request arriving at the client, such as experience, leveling, project stages, gaining resources and more, has improved. The way it works is the simplicity of database handling.

When the client earns experience to move to the next level, a token is generated and inserted in a valid MySQL table. This token is bound to the player, and the specific action done by the server. Since the user has to be noticed when something happens, such as a push-notice. A script is gathering each token which has not been pushed yet, and pushing to the client in real-time.





## 2017-03-24 live update ##

This update is really cool. I've developed the API to handle request mors sufficient and better runtime experience.

The features I've added are the features which completes the games interactive gameplay

I added the ability to cook raw food. In this case you will over time while leveling and unlocking achievements, earn x amount of foodtypes, in x amount of bulks. You can get unlucky to get raw food, which you don't want to feed your animal. In this scenario you'll have to use charcoal by purchasing it or earning it and lighting the furnace which holds for an hour before quenches. The raw food will be done within a timer in the application. This action has the option of adding spices to the food, which will increase the amount of happiness given to the animal when fed.

This feature will certainly not give the application a bad name, since it's just a cool feature which are pretty much optional. I have a few people whom helps me on the way of development, mostly to guide me through the logic of the interface. The features was much appreciated.

I've also develop the staging of the animal. Over time the animal has to grow older and die which are done by almost only math. What I did is that I first assigned a variable for the date time of creation. Now when the user requests the project, the **x = date time of creation** and **y = current date**. While **f = x - y** will return amount of minutes passed between these dates. **F** now owns the value of minutes passed.

The second variable is the amount of minutes before the animal dies, which are also dynamically created over time. Perhaps if the animal is badly fed or taken care of, the life span will decrease. Play with the thought of **L = life span**.

This specific animal has 4 stages/levels. So let's use the variables we have.

**f** contained the minutes passed until now, while **L** has the life span in minutes. Let's see if **f** is higher than one-fourth. If it is, then the next stage is prepared. Next stage will be two-fourths, until four-fourth A.K.A 100% is near death.

In pure PHP code this worked well, and I saw the opportunity of relying of backend code to take care of stages, rather than having a counter running in the background of the application, counting seconds then reporting back to server when the application is preparing to be closed.

## 2017-03-17 live update ##

Took the time to develop a system for giving players resources during gameplay. Picking random users and giving them random food, treats, water etc in random amounts.

Also created a client_incoming function where the user can see all experience, resources earned while logged off or inactive. Basically a message in the app saying. "You've earned experience since you were gone", "You've earned resources" and more.

Client_incoming will serve as a global function to be used for everything that SHOULD be sent to the client as a notice. "You've earned a new achievement", "You can now feed your Fox with meat", "Oh, your chicken is dying".

## 2017-03-14 live update ##

Currently working on a "Login with Facebook" module, we're I'm looking into Facebooks API.

Besides that I'm tweaking the infastructure of fetch_projects in the backend repository, since the health, strength and agility modules can return a higher or smaller value randomly. The module is built on a server response logged into the database and calculating the last response until the latest response and using the hours in between to evaluate the amount of reduction for the pets/projects stats, which in this case are strength, agility etc.

I've tested the application with a friend, and trying to feed the animal at the same time, fetching projects without any server interuptions nor errors. Which is great! Since the application is built on the idea of being semi-multiplayer, where two people take care of a pet. The module of fetching projects, feeding etc as two players can be hard to be written into code, but it seems like it will work in the long run at least.

Waiting for graphics for the application, rabbits, foxes, birds, eggs and more.

When the graphics are done, my main goal is to finish the leveling system, also the progress system for the pet, since the pet has to grow and become older.


## 2017-03-03 live update ##

Whilst waiting for design to be finished I've added features such as:
* overfeeding the creature
* limiting foodtypes depending on stage/level of the creature
* adding users own resources to a project. Such as meat, chicken, water, carrots etc from users inventory.
* developed API token authentication for accessing API as client.


## 2017-02-13 live update ##

Currently having issues with the (current status). In the images down below, you'll see the text "Waiting for hatch", which is not the current status. As the Energy and HP is low for the project, it should say something about that.

The projects can be fed with only cooked meat at the time...


### First page with all projects ###

![First page with all projects](https://bitbucket.org/repo/MjB94r/images/1422717603-IMG_0962%202.PNG)

### Inside a specific project ###

![Inside a specific project](https://bitbucket.org/repo/MjB94r/images/1262626998-IMG_0961%202.PNG)

### Inside projects resources. Attempting to add resources from user inventory. ####

![Inside projects resources. Attempting to add resources from user inventory.](https://bitbucket.org/repo/MjB94r/images/826300612-IMG_0964%202.PNG)

### Successfully added 12 pieces of cooked meat. Since 200 pieces ain't enough for foxes. ###

![Successfully added 12 pieces of cooked meat. Since 200 pieces ain't enough for foxes.](https://bitbucket.org/repo/MjB94r/images/1481564686-IMG_0965%202.PNG)
