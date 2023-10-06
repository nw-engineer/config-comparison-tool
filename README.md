# config-comparison-tool

This app is a comparison app for Config files, Code, etc.

## composition
- OS：Linux
- node：v16.18.1
- npm：8.19.2

## procedure
```bash
git clone https://github.com/nw-engineer/config-comparison-tool.git
cd config-comparison-tool
npm start
```
Please access using your browser.

http://_IPaddress_:3000

## screen image
Click the "file1" button at the top right of the screen and select the target file. (Same for file2)

compare!! Click the button to see the differences between the two files.
![画像](/screen1.png)

When you click on the difference display, a details screen will pop up.

![画像](/screen2.png)

The "Next Change" button will scroll to the line being changed.
"Exclude" allows you to specify strings to be excluded.(I think it can be used for purposes such as the encrypted display part of Fortigate's Config etc.)

"Show only differences" is a checkbox that allows you to display only the changed parts.
