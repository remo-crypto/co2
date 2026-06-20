# co2

# Carbon Footprint Simulator – Game Design Document (GDD)

## 1. Project Information

### Game Title

**Carbon Footprint Simulator: A Day in Your Life**

### Genre

Educational Simulation / Decision-Making Game

### Target Audience

* Age 12+
* Students
* Environmental awareness programs
* Schools and colleges

### Platform

* Web Browser (Desktop & Mobile)

### Game Duration

* **1 in-game day = 2–3 minutes in real life**
* Single-session experience
* Replayable with different choices and endings

---

# 2. Game Concept

The player lives through a typical working day as an office employee. From waking up in the morning until going to sleep, every decision affects the player's carbon footprint.

At the end of the day, the total carbon emissions are calculated and the player receives a sustainability title based on their environmental impact.

---

# 3. Learning Objectives

Players will learn:

* What a carbon footprint is.
* Which daily activities contribute most to carbon emissions.
* Sustainable alternatives for transportation, food, and energy usage.
* How small changes can reduce environmental impact.

---

# 4. Character Selection

Before starting the game:

### Option 1: Male Character

* Office employee
* Cosmetic appearance only

### Option 2: Female Character

* Office employee
* Cosmetic appearance only

Both characters have identical gameplay.

---

# 5. Gameplay Flow

```text
Wake Up
   ↓
Morning Shower
   ↓
Breakfast
   ↓
Home Appliance Usage
   ↓
Travel to Office
   ↓
Office Activities
   ↓
Lunch Break
   ↓
Shopping
   ↓
Return Home
   ↓
Dinner
   ↓
Watch TV
   ↓
Waste Disposal
   ↓
Sleep
   ↓
Carbon Report
   ↓
Ending
```

---

# 6. Carbon Footprint Values

All values are measured in **kg CO₂e (Carbon Dioxide Equivalent)**.

---

## A. Morning Shower (10 Minutes)

| Choice      | Carbon Value |
| ----------- | ------------ |
| Cold Shower | 0.05 kg      |
| Hot Shower  | 0.80 kg      |

---

## B. Breakfast

Player may choose multiple items.

| Food Item | Carbon Value |
| --------- | ------------ |
| Toast     | 0.15 kg      |
| Eggs      | 0.40 kg      |
| Coffee    | 0.20 kg      |
| Rice      | 0.60 kg      |

---

## C. Home Appliances

In the app, time-based options are available for appliance usage. You can enter durations using hh:mm:ss.

| Appliance               | Carbon Value |
| ----------------------- | ------------ |
| Fan (per hour)          | 0.05 kg      |
| Light (per hour)        | 0.02 kg      |
| Microwave (per 10 min)  | 0.12 kg      |
| Kettle (per 10 min)     | 0.10 kg      |

---

## D. Commuting

| Transport       | Carbon Value |
| --------------- | ------------ |
| Car             | 2.50 kg      |
| Public Bus      | 0.70 kg      |
| Motorcycle/Bike | 1.20 kg      |
| Bicycle         | 0.00 kg      |
| Walking         | 0.00 kg      |

---

# 7. Office Hours

---

## Computer Usage

| Activity            | Carbon Value |
| ------------------- | ------------ |
| Office Computer Use | 0.40 kg      |

---

## Internet Usage

| Activity     | Carbon Value |
| ------------ | ------------ |
| Internet Use | 0.20 kg      |

---

## Air Conditioner

| Duration | Carbon Value |
| -------- | ------------ |
| Per Hour | 0.60 kg      |

Use the app to enter how long the air conditioner runs during office hours with hh:mm:ss.

---

## Heater

| Duration | Carbon Value |
| -------- | ------------ |
| Per Hour | 1.00 kg      |

Use the app to enter how long the heater runs during office hours with hh:mm:ss.

---

## Coffee Break

| Item           | Carbon Value |
| -------------- | ------------ |
| One Cup Coffee | 0.20 kg      |

---

## Printing

| Quantity      | Carbon Value |
| ------------- | ------------ |
| Every 5 Pages | 0.05 kg      |

---

# 8. Lunch

Player may choose one or more items.

| Food Item      | Carbon Value |
| -------------- | ------------ |
| Rice           | 0.60 kg      |
| Chicken        | 1.60 kg      |
| Packaged Drink | 0.30 kg      |
| Vegetables     | 0.20 kg      |

---

# 9. Shopping

Random event during the day.

| Shopping Choice     | Carbon Value |
| ------------------- | ------------ |
| No Purchase         | 0.00 kg      |
| Sustainable Product | 0.20 kg      |
| New Clothing        | 2.00 kg      |
| Electronic Gadget   | 15.00 kg     |

---

# 10. Dinner

## Cooking

| Method           | Carbon Value |
| ---------------- | ------------ |
| Home Cooking     | 0.50 kg      |
| Electric Cooking | 0.80 kg      |
| Gas Cooking      | 1.00 kg      |

---

## Food Choice

| Food Item     | Carbon Value |
| ------------- | ------------ |
| Vegetables    | 0.30 kg      |
| Rice          | 0.60 kg      |
| Chicken       | 1.60 kg      |
| Packaged Food | 2.00 kg      |

---

# 11. Television

| Activity                 | Carbon Value |
| ------------------------ | ------------ |
| Watching TV (per hour)   | 0.08 kg      |

The app allows entering TV duration with hh:mm:ss.

---

# 12. Daily Waste Disposal

Waste generated depends on food consumed during the day.

| Waste Type                | Carbon Value |
| ------------------------- | ------------ |
| Properly Segregated Waste | 0.10 kg      |
| Mixed Waste               | 0.50 kg      |
| Excess Food Waste         | 1.00 kg      |

### Automatic Rule

If the player consumes:

* More packaged food → More waste
* More packaged drinks → More waste
* More take-away meals → More waste

---

# 13. Carbon Calculation Formula

```text
Total Carbon Footprint =

Shower
+ Breakfast
+ Appliances
+ Commute
+ Office Activities
+ Lunch
+ Shopping
+ Dinner
+ TV
+ Waste Disposal
```

---

# 14. Ending System

The ending is determined by the total carbon footprint.

---

## Green Man / Green Woman 

### Carbon Score: 0 – 8 kg CO₂e

Message:

> "Excellent! Your choices helped reduce environmental impact and promote sustainable living."

Reward:

* Green Badge
* Leaf Animation

---

## Eco Learner 

### Carbon Score: 8.01 – 15 kg CO₂e

Message:

> "Good effort! You understand sustainability, but there is still room for improvement."

Reward:

* Eco Badge

---

## Carbon Lover 

### Carbon Score: Above 15 kg CO₂e

Message:

> "Your lifestyle generated a high carbon footprint today. Try greener alternatives next time."

Reward:

* Detailed Carbon Report

---

# 15. End-Day Report Example

```text
DAILY CARBON REPORT

Morning Shower      : 0.80 kg
Breakfast           : 1.15 kg
Appliances          : 0.17 kg
Commute             : 2.50 kg
Office Activities   : 2.00 kg
Lunch               : 2.20 kg
Shopping            : 0.00 kg
Dinner              : 1.40 kg
TV                  : 0.08 kg
Waste Disposal      : 0.50 kg

-------------------------
TOTAL = 10.80 kg CO₂e
-------------------------

TITLE:
ECO LEARNER
```

---

# 16. Future Enhancements

* Achievement system
* Leaderboards
* Different professions
* Seasonal events
* Carbon offset activities
* Tree planting mini-games
* Classroom competitions
* Multiplayer sustainability challenge

This design provides a complete educational simulation where players learn the environmental impact of daily lifestyle choices within a short and engaging 2–3 minute gameplay session.
