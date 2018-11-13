 # What is the GOAL?

The GOAL of this "thing" is to answer the simple Question: 

**Would it be possible to prcisely detect a mobile Device over its RSSI signal via TRILATERATION?**

A specific Chapter will step through the "material" i found in the WEB. ( youtube, blog´s, etc )

I**n the CODE section i will place CODE i use to bring this to FLY...!! It is CODE out from my Experiment and Development.
Please see it as a kind of "SnapShot"..Not final, not Error-Free..More Info I will write in the WiKi beside this Development.**

**The very rough basic concept is as follows**

We construct 3 Double-Nodes...one of those nodes is the sniffer ( for mac, rssi and stuff ) sending the collected results via PJON to its Partner MCU of the Double-Node ( Sender )...each of the 3 Double-Node-Senders transfer those Data to a webservice e.g. DB..Synch is done via UDP...so one of the D-Nodes has a Master-Role. On database side i made some specific "filtering" based on THE [KALMAN FILTER](https://de.wikipedia.org/wiki/Kalman-Filter)...now die RSSI is ready and giving coordinates...the moment this is looking very promising...but just to "see" this in DB or with report builder is for sure not enought...next days i will bring this into a webGL ( ThreeJS ) "Engine" and then  hopefully will see my Trilateral POINT visualized in Real-Time....

This is the MAC/RSSI in realtime currently produced by 3 DoubleNodes ( in the corners of my house! )

![grafik](https://user-images.githubusercontent.com/37293282/48116304-faacc100-e265-11e8-8561-ceb13f55bea7.png)


preview on the ThreeJS collision Mechanic to get the Trilateration-Point:

[![Watch the video](http://img.youtube.com/vi/uNQ-2lvWuX8/maxresdefault.jpg )](https://www.youtube.com/watch?v=uNQ-2lvWuX8)


This doc here will be build in parallel to the development of all this...it´s now 12.11.2018 ...08:16

