# Luach ![Luach](https://www.compute.co.il/luach/app/Images/Feature.png "Luach Logo")

Luach is a React-Native mobile project to keep track of a Jewish womens Halachic calendar.

The app is available for IOS users at
[this link](https://itunes.apple.com/us/app/luach/id1259500420) 
and for Android at [this link](https://play.google.com/store/apps/details?id=com.luachandroid).

It calculates all the days that require Halachic restrictions including calculations for Vesset Kavuah.

Besides for the *Niddah* calendar functionality, Luach also shows the *Zmanim* for anywhere in the world and has an Event/Occasion calendar as well.

The data is stored locally on the running device in an SQLite database.
The react-native-sqlite-storage package is used to connect to this database.

All the GUI related modules are in the App/GUI directory and the underlying functionlity is in the App/Code directory.

The App/Code directory has three sub-directories:
* Chashavshavon - All the code pertaining to the laws of *Niddah* calculations.
* Data - The code that connects to the database and holds the application data.
* JCal - All the code pertaining to calendars, dates and daily *Zmanim*.

The Chashavshavon and JCal folders can each be used as a stand-alone library for their respective subjects.
The Chashavshavon library depends on the JCal classes but not vice versa.
Neither one, rely on any of the classes in App/Data.
