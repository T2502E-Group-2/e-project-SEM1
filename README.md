Project Setup Guide
A. Required Libraries

I. Frontend
• React Slick & Slick Carousel: npm install react-slick slick-carousel
• PayPal Integration: npm install @paypal/react-paypal-js
• Core Utilities (Axios, Router, Bootstrap, Icons): npm install axios react-router-dom react-bootstrap react-bootstrap-icons
• Rich Text Editor
o React-Quill: npm install react-quill-new
o Quill Plugin (HTML Edit Button): npm install quill-html-edit-button

---

II. Backend
!!!!! IMPORTANT !!!!!!
DATABASE:
Please create a database named e-project-1 and import DB Final_e-project-1.sql (attached with project files) via MyPHP Admin (MAMP).
DB name: e-project-1

• HTTP Client (Guzzle)
• composer require guzzlehttp/guzzle
• ImageKit SDK for PHP
• composer require imagekit/imagekit-php
• PHP Configuration (php.ini Setup)
Ensure the following extensions are enabled in your Apache server’s php.ini files:
• extension=curl
• extension=fileinfo
o For MAMP (Windows Example):
o ...\MAMP\bin\[php-version]\php.ini → enable: extension=curl, extension=fileinfo
o ...\MAMP\conf\[php-version]\php.ini → ensure line: extension=php_curl.dll  
o add line: extension=fileinfo
• Verification Steps:

1. To confirm which php.ini file your Apache server is using, create an info.php file:
2. <?php phpinfo(); ?>
   and access it via:
   http://localhost:8888/API/info.php
3. To verify environment settings, visit:
4. http://localhost:8888/API/check_env.php

---

B. Functionality Testing
I. PayPal Sandbox
• Test Account
o Email: sb-us475l45173679@personal.example.com
o Password: Aa123456@
II. User Accounts
• Admin Accounts
o admin@example.com
• Member Account
o user1@example.com
(Default password for all test accounts: 123456)
