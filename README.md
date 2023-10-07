# config-comparison-tool

This app is a comparison app for Config files, Code, etc.


https://github.com/nw-engineer/config-comparison-tool/assets/28122316/5e373b13-8b42-438d-959a-fd75d44585d9


## composition
- OS：Linux
- node：v16.18.1
- npm：8.19.2

## procedure
```bash
git clone https://github.com/nw-engineer/config-comparison-tool.git
cd config-comparison-tool
npm install --legacy-peer-deps
npm start
```
Please access using your browser.

http://_IPaddress_:3000

**When using nginx.**
```bash
git clone https://github.com/nw-engineer/config-comparison-tool.git
cd config-comparison-tool
cp app.conf /etc/nginx/conf.d/
mkdir -p /var/www/html/
mv build.tar.gz /var/www/html/
cd /var/www/html/
tar zxvf build.tar.gz && chown -R nginx:nginx build && rm -rf build.tar.gz
systemctl restart nginx
```
Please access using your browser.

http://_IPaddress_

## screen image
Click the "file1" button at the top right of the screen and select the target file. (Same for file2)

compare!! Click the button to see the differences between the two files.
![画像](/screen1.png)

When you click on the difference display, a details screen will pop up.

![画像](/screen2.png)

The "Next Change" button will scroll to the line being changed.
"Exclude" allows you to specify strings to be excluded.(I think it can be used for purposes such as the encrypted display part of Fortigate's Config etc.)

"Show only differences" is a checkbox that allows you to display only the changed parts.
