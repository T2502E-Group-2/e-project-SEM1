A. Require Libraries:
I. FRONTEND

- React-slick and Slick-carousel : npm install react-slick slick-carousel
- React PayPal : npm i @paypal/react-paypal-js
- Axios, Router DOM, Bootstrap, React-bootstrap-icons: npm i axios react-router-dom react-bootstrap react-bootstrap-icons
- CKEditor : npm i ckeditor5 ckeditor5-premium-features @ckeditor/ckeditor5-react
- React-Quill : npm install react-quill@2.0.0 --force
- Quill Plugin : npm install quill-html-edit-button

II. BACKEND

- PHP guzzle : composer require guzzlehttp/guzzle
- imagekit/imagekit-php : composer require imagekit/imagekit-php
- php.ini set up require (Make sure extension=curl and extension=fileinfo in the php.ini file of your Apache Server were enabled):

* ...MAMP\bin\[phpversion]\php.ini: extension=curl extension=fileinfo
* ...MAMP\conf\[phpversion]\php.ini: Fine line of: extension=php_curl.dll, add: extension=fileinfo

- Notes: If you want to know exactly where your Apache Server used php.ini, run api "info.php" on your local host server. Ex: http://localhost:8888/API/info.php

B. FUNCTION TEST
I. PayPal Sandbox acount
Acount : sb-us475l45173679@personal.example.com
Passwords: Aa123456@

II. User account (Password: 123456)
Admin : admin@example.com
duy.nguyen@example.com

Member: user1@example.com
