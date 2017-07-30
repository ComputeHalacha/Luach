# LuachAndroid
LuachAndroid is a React-Native mobile project to keep track of a Jewish womens Halachic calendar.

The *Android* part of the mame is a misnomer and the app runs on IOS as well.

The compiled app is available for IOS at
[this link](https://itunes.apple.com/us/app/luach/id1259500420) and for Android at [this link](https://play.google.com/store/apps/details?id=com.luachandroid).

Besides for the *Niddah* calendar functionality, Luach also shows the *Zmanim* for anywhere in the world and has an Event/Occasion calendar as well.

All the react-native code is in the App directory with the entry point being a react-navigation StackNavigator.

The data is stored locally on the running device in an SQLite database.
The excellent react-native-sqlite-storage is used to connect to the database.

All the GUI related modules are in the App/GUI directory and the underlying functionlity is in the App/Code directory.

The App/Code directory has three sub directories:
* Chashavshavon - All the code pertaining to the laws of *Niddah*.
* Data - The code that connects and holds the application data.
* JCal - All the code pertaining to dates and *Zmanim*.

The Chashavshavon and JCal folders can each be used as a stand-alone library for their respective subjects.
The Chashavshavon library depends on the JCal classes but not vice versa.
Neither one needs the classes in App/Data.