---
title: 'How to Set Up MediaWiki Using Apache'
pubDate: 2024-04-07T19:07:00.000-05:00
summary: 'Learn about how to set up your own wiki or family of wikis!'
author: 'Aaron Yoder'
authorTitle: ''
tags: ['tutorial', 'web', 'cloud', 'mediawiki']
---

We recently got involved in a wiki project, [which you can check out here](https://soulsborne.wiki/). Soon after that, we concluded that having internal wikis for our own titles would be a really good way to supplement and enhance our game design documents. However, we quickly realized that MediaWiki's official tutorials are quite lacking; they make a lot of assumptions about what you know, and so we found it difficult to follow, requiring lots of extra research outside of the official help articles.

In this step-by-step guide, we will go over how to set up a wiki using [MediaWiki 1.41.1](https://www.mediawiki.org/wiki/Download), how to enable short URLs, and how to turn your wiki into a multi-wiki family with shared user accounts. We assume you have little-to-no domain knowledge, so just about anyone should be able to follow this guide. We'll be setting things up on a Google Cloud virtual machine, but you can also set this up on your own local setup or your preferred cloud provider, though specifics about how to set up your local environment may vary. We will not be offering any help for setting this up on a Windows machine, though this is definitely possible to do.

## Assumptions

We will be using a Google Cloud E2-small VM running Debian 12. We use Cloudflare for our domain registration, DNS, and caching.

We'll be making the following assumptions:
* You understand how to portforward or enable HTTP/HTTPS traffic on your local setup or cloud provider.
* If using a cloud provider, you have a basic understanding of how to set up a new virtual machine on said cloud provider.
* You understand how to run commands in a Linux terminal.
* You understand how to SSH into a server, and how to use the `scp` command.
* You understand how to modify basic DNS records.

## Setup

First, ensure that you allow HTTP and HTTPS traffic on the device you'll be hosting the wiki on. This could be as simple as checking two boxes when creating your VM, or it could mean portforwarding ports 80 (TCP) and 443 (TCP) for traffic running to your host machine.

Next, you'll want to make sure your domain/subdomains are pointing to the server you'll be hosting the wiki on. You can do this with `A` records if using IPv4, or `AAAA` records if using IPv6.

After that, open a terminal or SSH into your server. If you are using a different package manager, then modify the commands below as necessary.

To be sure everything is up to date before starting, you can run `sudo apt update && sudo apt upgrade`, though this may not be strictly necessary on a fresh install from a cloud provider.

## Install Dependencies

### Install Git

If you don't already have it installed, then go ahead and install git:  
`sudo apt install git`

### Install Apache2

Install Apache2 using the following command:  
`sudo apt install apache2`

Next, disable directory listings:  
`sudo sed -i "s/Options Indexes FollowSymLinks/Options FollowSymLinks/" /etc/apache2/apache2.conf`

After that, we will restart the Apache2 service and ensure it runs automatically after a reboot:  
`sudo systemctl restart apache2.service && sudo systemctl enable apache2.service`

### Install MariaDB

MediaWiki requires a database server in order to function correctly. They recommend MariaDB, so that's what we'll be using.  
`sudo apt install mariadb-server`

After that, restart the service and ensure it runs automatically on startup:  
`sudo systemctl restart mariadb.service && sudo systemctl enable mariadb.service`

#### Securing Database Installation

You will want to secure your database installation using the following command:  
`sudo mysql_secure_installation`

Follow the prompt:  
```
In order to log into MariaDB to secure it, we'll need the current
password for the root user. If you've just installed MariaDB, and
haven't set the root password yet, you should just press enter here.

Enter current password for root (enter for none): <enter root password or press enter>
OK, successfully used password, moving on...
```

You may see the following message:  
```
Setting the root password or using the unix_socket ensures that nobody
can log into the MariaDB root user without the proper authorization.

You already have your root account protected, so you can safely answer 'n'.

Switch to unix_socket authentication [Y/n]
```

If it tells you that you can safely answer 'n' at each step, then do so.

Otherwise, follow the prompts as shown:  
```
Enter current password for root (enter for none): <password or enter>
Set root password? [Y/n]: Y
New password: <password>
Re-enter new password: <password>
```

From here, answer the prompts as shown:  
```
Remove anonymous users? [Y/n]: Y
Disallow root login remotely? [Y/n]: Y
Remove test database and access to it? [Y/n]:  Y
Reload privilege tables now? [Y/n]:  Y
```

Finally, restart MariaDB again:  
`sudo systemctl restart mariadb.service`

### Install PHP

This command will install PHP and related packages:  
`sudo apt install php php-common php-mysql php-xml php-mbstring libapache2-mod-php`

### Install Wiki Utilities

This command will install useful dependencies that the MediaWiki software will automatically utilize:  
`sudo apt install php-intl php-apcu php-cli php-curl php-bcmath imagemagick`

### Configure PHP

Open the PHP initialization file using your favorite text editor:  
`sudo vim /etc/php/*/apache2/php.ini`

You will need to search through the file to find various parameters listed below and ensure they are set how you like. In Vim, you initiate a search by typing `:/` and then type what you want to search for. In order to start editing, you can type `a` and then begin editing, navigating with the arrow keys. To stop editing, press the `Esc` key.  
```
file_uploads = On
allow_url_fopen = On
memory_limit = 128M
upload_max_filesize = 100M
max_execution_time = 360
date.timezone = <tzdata-timezone>
```

For a list of valid timezone names, see [this Wikipedia article](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). You want the name under the **TZ identifier** column header; just match it up with your current UTC offset and geographical location. If you don't care about the timezone or want to use UTC as the default, use `Etc/UTC`.

Note: You may not want to turn file uploads on right away, or at all. If not, just go ahead and keep it set to 'Off'. You can always easily enable them later if needed.

Finally, you'll want to save the file and exit. If using Vim, press `Esc` to stop editing and then type `:wq!` to save and quit.

## Install MediaWiki

### Create a MediaWiki Database

The database name you pick is sort of like a 'Wiki ID', so choose something identifiable. For this tutorial, we'll just go with `main`. 

Note for those who want to create a family of wikis: When you create your wiki database, you'll be creating a system user for the database. If you plan to make a connected family of wikis, you'll need to create a database for each one, and each one also needs to have its own system user. If you want to share data across your family of wikis, such as the user table, you'll need to select a wiki whose database is the 'main' database, with other database system users having the correct permissions for the main database. If you have a connected family of wikis, it's likely you'll have a meta wiki, so you could make the meta wiki first and use that database as the main one.

Use the following command (and enter the root password as necessary) to start interacting with the database software:  
`sudo mysql -u root -p`

Create the database with your chosen name:  
`CREATE DATABASE main;`

Create a database user called `sysadmin` (or whatever name you prefer) and select a password:  
`CREATE USER 'sysadmin'@'localhost' IDENTIFIED BY 'password';`

Grant `sysadmin` full database access:  
`GRANT ALL PRIVILEGES ON main.* TO 'sysadmin'@'localhost' IDENTIFIED BY 'password' WITH GRANT OPTION;`

Save your changes and exit:  
```
FLUSH PRIVILEGES;
EXIT;
```

### Download & Install MediaWiki

You can find the latest MediaWiki version [here](https://www.mediawiki.org/wiki/Download) and you can view all available releases [here](https://releases.wikimedia.org/mediawiki/).

Change to the `/tmp` directory and download MediaWiki:  
`cd /tmp && wget https://releases.wikimedia.org/mediawiki/1.41/mediawiki-1.41.1.tar.gz`

Create an installation directory and extract the contents into that directory:  
```
sudo mkdir -p /var/www/html/mediawiki
sudo tar -zxvf mediawiki-*.tar.gz
sudo mv mediawiki-*/* /var/www/html/mediawiki
```

Adjust ownership and permissions:  
`sudo chown -R www-data:www-data /var/www/html/mediawiki/ && sudo chmod -R 755 /var/www/html/mediawiki/`

### Configure Apache2

We now need to create an Apache2 configuration file for our MediaWiki installation:  
`sudo vim /etc/apache2/sites-available/mediawiki.conf`

You can copy and paste these contents into the file:  
```
<VirtualHost *:80>
  ServerAdmin <email>
  DocumentRoot /var/www/html/mediawiki
  ServerName <IP/domain of host machine>
  ServerAlias <alternative URLs to go to your wiki>
#  ErrorDocument 404 /404.html # Uncomment this line if you want to create a custom 404 page placed in the document root

  <Directory /var/www/html/mediawiki/>
    Options +FollowSymlinks
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined

  <Directory /var/www/html/mediawiki/images/>
    AllowOverride None
    AddType text/plain .html .htm .shtml .phtml
    php_admin_flag engine off
    Header set X-Content-Type-Options nosniff
  </Directory>
</VirtualHost>
```

Make sure you modify the `ServerAdmin`, `ServerName`, and `ServerAlias` fields as necessary. If you do not have alternative URLs, you can delete the `ServerAlias` line entirely.

Once you're done, you can save and exit. If using Vim, type `:wq!`.

### Configure MediaWiki

Disable the default Apache2 configuration:  
`sudo a2dissite 000-default.conf`

Enable the MediaWiki configuration we just created:  
`sudo a2ensite mediawiki.conf`

Enable the mod_header module:  
`sudo a2enmod headers`

Enable the mod_rewrite module:  
`sudo a2enmod rewrite`

Restart the Apache2 service:  
`sudo systemctl restart apache2.service`

Once that's all done, you can now visit your website in the browser to finish setting up your wiki. You can visit your wiki by entering the IP address or domain where the MediaWiki installation is hosted.

## MediaWiki In-Browser Setup

Once you select your language and the wiki's language, the next page should tell you a bit about your installation. If it says you can install MediaWiki, then you can go ahead and continue.

On the next page, it will ask you some information about your database. Enter the information as you've set it up; if you've followed this guide, you just need to enter `main` into the "Database name" box. In addition, you'll need to enter the database username and password for the database user we created earlier. Following this guide, that would be `sysadmin` and whatever password you selected for the database user.

Continue onto the next page and select the option to use the same account as installation for web access. Continuing to the next page again, you'll need to enter the name of the wiki, as well as create your MediaWiki administrator account. Keep in mind this administrator account is different from all of the other ones, and is used by you to do administrative tasks on the wiki.

From here, you'll want to make sure to select "Ask me more questions.", as a lot of these questions are important for setting up your wiki properly. Go through and select the options you want. Our setup can be seen below.

### Skins

- [x] MinervaNeue
- [ ] MonoBook
- [ ] Timeless
- [x] Vector

We use Vector as the default skin.

### Extensions

- [ ] CiteThisPage
- [x] Echo
- [x] Interwiki
- [ ] Linter
- [ ] Nuke
- [ ] ReplaceText

### Editors

- [x] CodeEditor
- [x] VisualEditor
- [x] WikiEditor

### Parser hooks

- [x] CategoryTree
- [x] Cite
- [x] ImageMap
- [x] InputBox
- [x] Math
- [x] ParserFunctions
- [x] Poem
- [x] Scribunto
- [x] SyntaxHighlight
- [x] TemplateData

### Media handlers

- [ ] PdfHandler

### Spam prevention

- [x] AbuseFilter
- [ ] ConfirmEdit
- [x] SpamBlacklist
- [x] TitleBlacklist

### API

- [x] PageImages

### Other

- [ ] DiscussionTools
- [x] Gadgets
- [x] LoginNotify
- [x] MultimediaViewer
- [x] OATHAuth
- [ ] SecureLinkFixer
- [x] TextExtracts
- [x] Thanks

## Finishing Setup

If you like, you can also enable file uploads and enable Instant Commons for access to common WikiMedia assets. You can also set the logo, but this can always be done later as well. Once you're done, hit continue at the bottom of the page, and then hit continue again on the next page to install everything. Once that's all done, hit continue once again.

You're just about done! You will need to download `LocalSettings.php` now and place it in your MediaWiki directory on your server (in our case, this is `/var/www/html/mediawiki/`), and then enter your wiki only after this is done.

Once you do that, you're finished with basic setup! Congratulations!

## Setting up Uploads

In order for users to upload images to your wiki, you need to make sure your server has the correct file permissions. You can ensure this by doing the following:

First, ensure your upload directory has the correct permissions. If you changed your upload directory using `$wgUploadDirectory` then adjust these commands as necessary, but for our purposes we will refer to the upload directory as `/var/www/html/mediawiki/images`.

Run the following commands:
```
sudo chmod -R 755 /var/www/html/mediawiki/images
sudo chmod -R -x+X /var/www/html/mediawiki/images
sudo chown -R www-data:www-data /var/www/html/mediawiki/images
```

These commands ensure the following:
* User can read, write, and execute. Group can read and execute. World can read and execute.
* Only folders have executable permissions; files do not.
* The server user owns the images directory and can make modifications and additions.

Once this is done, you can edit `LocalSettings.php` and set `$wgEnableUploads = true;`.

If you follow the instructions below to create a family of wikis and only want uploads enabled on some wikis instead of all of them, then delete `$wgEnableUploads = true;` from `LocalSettings.php` and put it in each wiki-specific `LocalSettings_<wikiID>.php` file instead. 

## Creating a Wiki Family

This section of the tutorial will teach you how to create multiple wikis that use the same web server and MediaWiki source code, as well as share user tables, but are otherwise independent.

### Create Databases

You will need to create the databases for each wiki first. Keep in mind this assumes you've done all of the above. If creating a family of wikis, you need to designate one wiki database to be the main one. For our purposes, this will be the first wiki database we created, `main`.


Step 1. Begin interacting with the database software:  
`sudo mysql -u root -p`

Step 2. Create the database with your chosen name:  
`CREATE DATABASE newwiki;`

Step 3. Create a database user called `newwikiadmin` and select a password:  
`CREATE USER 'newwikiadmin'@'localhost' IDENTIFIED BY 'newpassword';`

Step 4. Grant `newwikiadmin` full access to the `newwiki` database:  
`GRANT ALL PRIVILEGES ON newwiki.* TO 'newwikiadmin'@'localhost' IDENTIFIED BY 'newpassword' WITH GRANT OPTION;`

Step 5. Next, you'll need to grant your `newwikiadmin` database user access to the `user`, `user_properties`, and `actor` tables.  
```
GRANT SELECT, UPDATE, INSERT, ALTER on main.user to 'newwikiadmin'@'localhost';
GRANT SELECT, UPDATE, INSERT, ALTER on main.actor to 'newwikiadmin'@'localhost';
GRANT SELECT, UPDATE, INSERT, ALTER, DELETE on main.user_properties to 'newwikiadmin'@'localhost';
GRANT CREATE, INDEX, ALTER on main.user_autocreate_serial to 'newwikiadmin'@'localhost';
```

Repeat steps 2 through 5 for each wiki you want to create, creating a separate user for each database, each with a unique password.

Save your changes and exit:  
```
FLUSH PRIVILEGES;
EXIT;
```

### Updating DNS Settings

Make sure you point your other wiki subdomains to the server hosting the wikis; this will be the same server that you set up your first wiki on. You would do this wherever you handle DNS settings, which is Cloudflare DNS for us.

### Updating Apache Configuration

You'll also need to modify your Apache configuration (`sudo vim /etc/apache2/sites-available/mediawiki.conf`) slightly. Add whatever URLs you are using for your other wikis to the `ServerAlias` section, separated by commas. You can use wildcards here to make it easier if you like, such as using `*.example.com` to cover all subdomains for `example.com`.

Example:  
```
<VirtualHost *:80>
  ServerAdmin <email>
  DocumentRoot /var/www/html/mediawiki
  ServerName <IP/domain of host machine>
  ServerAlias *.example.com
#  ErrorDocument 404 /404.html # Uncomment this line if you want to create a custom 404 page placed in the document root
  
  <Directory /var/www/html/mediawiki/>
    Options +FollowSymlinks
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined

  <Directory /var/www/html/mediawiki/images/>
    AllowOverride None
    AddType text/plain .html .htm .shtml .phtml
    php_admin_flag engine off
    Header set X-Content-Type-Options nosniff
  </Directory>
</VirtualHost>
```

### Setting up LocalSettings.php

Navigate to your MediaWiki directory. For us, that is `/var/www/html/mediawiki/`. If you followed this tutorial, you'll have a `LocalSettings.php` file for your primary wiki already set up. You should now rename it to `LocalSettings_main.php`. If you used a different name than `main` for your first wiki, make sure you use that name instead.

At this point, you should now visit all of your other wikis in the browser and go through the setup process just as we did before, generating a `LocalSettings.php` each time. Make sure you enter the correct database name, user, and password for each. Also, when it asks you to create an administrator account, you can either use the same account (with the same password) as you used for the first wiki, or create a separate admin account for each wiki.

Rename each of the generated `LocalSettings.php` files in turn, following the same format as above, using the same name as your wiki database names, `LocalSettings_<wikiID>.php`, and move all of your `LocalSettings` files into the MediaWiki directory mentioned above.

After that, create a new `LocalSettings.php` file in your MediaWiki directory and enter the following:  
```
<?php
$wikis = [
    'example.com' => 'main',
    'one.example.com' => 'newwiki',
];
if ( defined( 'MW_DB' ) ) {
    // Automatically set from --wiki option to maintenance scripts
    $wikiID = MW_DB;
} else {
    // Use MW_DB environment variable or map the domain name
    $wikiID = $_SERVER['MW_DB'] ?? $wikis[ $_SERVER['SERVER_NAME'] ?? '' ] ?? null;
}

if ( $wikiID ) {
    require_once "LocalSettings_$wikiID.php";
} else {
    die( 'Unknown wiki.' );
}

$wgSharedDB = 'main';
$wgSharedTables = array_merge( $wgSharedTables, ['user', 'user_properties', 'user_autocreate_serial', 'actor'] );

$wgCookieDomain = '.example.com';

// Add any settings that should apply to all wikis below this line
```

In the `$wikis` array, you need to enter a domain and then point it to the appropriate wiki ID. This should match up with the database name and `LocalSettings_<wikiID>.php` file.

The `$wgSharedDB` variable points to the primary wiki database as mentioned previously. The `$wgSharedTables` variable describes which tables should be shared. The `user` and `user_properties` tables are shared by default, but it doesn't hurt to list them anyway for clarity.

Finally, the `$wgCookieDomain` variable points to the top-level domain used for your family of wikis, which allows you to share login sessions across all of them.

At this point, you should be able to access all of your wikis, which will each be independent. You should also be able to create an account on one wiki and use it across all of your wikis.

Congratulations!

## Setting Up Short URLs

By default, your wiki page URLs will look something like `https://mywiki.com/index.php/Main_Page`. However, what we want is for the main page to just look like `https://mywiki.com/` and for our other pages to look like `https://mywiki.com/w/Example`.

To generate everything we need, go to [this website](https://shorturls.redwerks.org/). Start by entering your current wiki URL into the input box, and then hit "Go".

Next, press the button that says that you have root access to the server config, which you should.

Finally, enter the article format you'd like to have. For example, we want our wiki URLs to look like `https://mywiki.com/w/Example`, so we'd enter `/w/$1` into the Article Path input box. Once you've done that, hit "submit".

Next, edit `LocalSettings.php` and put `$wgScriptPath` and `$wgArticlePath` as mentioned, and add `$wgUsePathInfo` and set it to `true`. If you created a family of wikis and want a different URL format for each, then modify each `LocalSettings_<wikiID>.php` file independently instead. Keep in mind this may also cause your rewrite rules to be much more complex.

If you want to change your root domain so that `https://mywiki.com/index.php/Main_Page` is just `https://mywiki.com/`, additionally add `$wgMainPageIsDomainRoot = true;` to the file.

Your `LocalSettings.php` file will now contain something like this:  
```
...
// Add any settings that should apply to all wikis below this line

$wgScriptPath = "";
$wgArticlePath = "/w/$1";
$wgUsePathInfo = true;
$wgMainPageIsDomainRoot = true;
```

Save and quit when you are done.

Now we need to modify our Apache configuration:  
`sudo vim /etc/apache2/sites-available/mediawiki.conf`

Add the rewrite rules as provided by the linked website. For us, our configuration file now looks something like:  
```
<VirtualHost *:80>
  ServerAdmin contact@example.com
  DocumentRoot /var/www/html/mediawiki
  ServerName example.com
  ServerAlias *.example.com
#  ErrorDocument 404 /404.html # Uncomment this line if you want to create a custom 404 page placed in the document root
  
  <Directory /var/www/html/mediawiki/>
    Options +FollowSymlinks
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined

  RewriteEngine On

  # Set up short URLs: rewrite requests to /w/* to index.php
  RewriteRule ^/?w(/.*)?$ %{DOCUMENT_ROOT}/index.php [L]

  # Redirect / to main page
  RewriteRule ^/*$ %{DOCUMENT_ROOT}/index.php [L]

  # Rewrite image thumbnail requests to thumb.php
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-f
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-d
  RewriteRule ^/?images/thumb/[0-9a-f]/[0-9a-f][0-9a-f]/([^/]+)/([0-9]+)px-.*$ %{DOCUMENT_ROOT}/thumb.php?f=$1&width=$2 [L,QSA,B]

  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-f
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-d
  RewriteRule ^/?images/thumb/archive/[0-9a-f]/[0-9a-f][0-9a-f]/([^/]+)/([0-9]+)px-.*$ %{DOCUMENT_ROOT}/thumb.php?f=$1&width=$2&archived=1 [L,QSA,B]

  <Directory /var/www/html/mediawiki/images/>
    AllowOverride None
    AddType text/plain .html .htm .shtml .phtml
    php_admin_flag engine off
    Header set X-Content-Type-Options nosniff
  </Directory>
</VirtualHost>
```

You can now save and quit.

Restart the Apache2 service:  
`sudo systemctl restart apache2.service`

Verify that your main page is just your desired domain name, and that articles have short URLs as you've set them up. If everything seems to be in order, then you're ready for the next step.

## Use a different robots.txt and favicon.ico for each wiki in a wiki family

Right now, we can only have a single `robots.txt` or `favicon.ico` file inside of `/var/www/html/mediawiki/`. However, we may want to serve a different `robots.txt` file for each wiki. This is especially true if we want to point to each wiki's sitemap inside of the `robots.txt` file without having to host each wiki on a separate apache configuration.

The general goal is to internally redirect `subdomain1.example.com/robots.txt` to a `robots_subdomain1.txt` file and prevent direct access of `robots_subdomain1.txt` from other subdomains on the same host. We might also want to have a fallback `robots.txt` file in case `robots_subdomain1.txt` does not exist, and we do not want to have to manually specify each subdomain; we want it to automatically find the right `robots.txt` file. We also want to accomplish much the same thing with the `favicon.ico` file. We could also put our files in another directory, but we'll keep it relatively simple for this example.

Start by modifying the Apache configuration:  
`sudo vim /etc/apache2/sites-available/mediawiki.conf`

Add the following rewrite rules to the beginning:
```
# Redirect favicon.ico based on which wiki we are on
RewriteCond %{REQUEST_URI} ^/favicon\.ico
RewriteCond %{HTTP_HOST} ^(?!www)([a-z]+)\.example\.com
RewriteCond %{DOCUMENT_ROOT}/favicon_%1.ico -f
RewriteRule ^/?(.*)$ favicon_%1.ico [L]

# Redirect direct requests to "robots_<subdomain>.txt" to "robots.txt" on <subdomain>
RewriteCond %{ENV:REDIRECT_STATUS} ^$
RewriteCond %{REQUEST_URI} ^/robots_([a-z]+)\.txt
RewriteRule ^/?(.*)$ https://$1.example.com/robots.txt [R=301,L]

# Rewrite "robots.txt" to "robots_<subdomain>".txt
RewriteCond %{REQUEST_URI} ^/robots\.txt
RewriteCond %{HTTP_HOST} ^(?!www)([a-z]+)\.example\.com
RewriteCond %{DOCUMENT_ROOT}/robots_%1.txt -f
RewriteRule ^/?(.*)$ robots_%1.txt [L]
```

Our Apache configuration now looks something like this:

```
<VirtualHost *:80>
  ServerAdmin contact@example.com
  DocumentRoot /var/www/html/mediawiki
  ServerName example.com
  ServerAlias *.example.com
#  ErrorDocument 404 /404.html # Uncomment this line if you want to create a custom 404 page placed in the document root
  
  <Directory /var/www/html/mediawiki/>
    Options +FollowSymlinks
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined

  RewriteEngine On

  # Redirect favicon.ico based on which wiki we are on
  RewriteCond %{REQUEST_URI} ^/favicon\.ico
  RewriteCond %{HTTP_HOST} ^(?!www)([a-z]+)\.example\.com
  RewriteCond %{DOCUMENT_ROOT}/favicon_%1.ico -f
  RewriteRule ^/?(.*)$ favicon_%1.ico [L]

  # Redirect direct requests to "robots_<subdomain>.txt" to "robots.txt" on <subdomain>
  RewriteCond %{ENV:REDIRECT_STATUS} ^$
  RewriteCond %{REQUEST_URI} ^/robots_([a-z]+)\.txt
  RewriteRule ^/?(.*)$ https://$1.example.com/robots.txt [R=301,L]

  # Rewrite "robots.txt" to "robots_<subdomain>".txt
  RewriteCond %{REQUEST_URI} ^/robots\.txt
  RewriteCond %{HTTP_HOST} ^(?!www)([a-z]+)\.example\.com
  RewriteCond %{DOCUMENT_ROOT}/robots_%1.txt -f
  RewriteRule ^/?(.*)$ robots_%1.txt [L]

  # Set up short URLs: rewrite requests to /w/* to index.php
  RewriteRule ^/?w(/.*)?$ %{DOCUMENT_ROOT}/index.php [L]

  # Redirect / to main page
  RewriteRule ^/*$ %{DOCUMENT_ROOT}/index.php [L]

  # Rewrite image thumbnail requests to thumb.php
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-f
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-d
  RewriteRule ^/?images/thumb/[0-9a-f]/[0-9a-f][0-9a-f]/([^/]+)/([0-9]+)px-.*$ %{DOCUMENT_ROOT}/thumb.php?f=$1&width=$2 [L,QSA,B]

  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-f
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} !-d
  RewriteRule ^/?images/thumb/archive/[0-9a-f]/[0-9a-f][0-9a-f]/([^/]+)/([0-9]+)px-.*$ %{DOCUMENT_ROOT}/thumb.php?f=$1&width=$2&archived=1 [L,QSA,B]

  <Directory /var/www/html/mediawiki/images/>
    AllowOverride None
    AddType text/plain .html .htm .shtml .phtml
    php_admin_flag engine off
    Header set X-Content-Type-Options nosniff
  </Directory>
</VirtualHost>
```

After completing these steps, going to `subdomain1.example.com/robots.txt` will serve us the `robots_subdomain1.txt` file without changing the URL. It will also prevent direct access of the `robots_subdomain.txt` files on another subdomain. So, for example, if you tried to go to `subdomain2.example.com/robots_subdomain1.txt`, then it would redirect us to `subdomain1.example.com/robots.txt`. Finally, we are also able to use a fallback `robots.txt` file just in case the `robots_<subdomain>.txt` file does not exist.

Similarly, the correct `favicon.ico` file is now used depending on which site subdomain you are on, and a fallback `favicon.ico` file is used if `favicon_<subdomain>.txt` does not exist.

Please note that these changes may take a while to fully reflect on your end if your site is cached in your browser. You can try to flush your DNS cache and delete your browser cache to see the changes immediately.

### Action Pages

You might notice that when you do an action, such as edit, delete, or check a page's history, the URLs are not short. There's an easy fix for that: `$wgActionPaths`.

Add the following to your `LocalSettings.php`:  
```
...
// Adjust action path URLs
$actions = [
	'delete',
	'edit',
	'history',
	'protect',
	'unprotect',
	'purge',
	'render',
	'submit',
	'watch',
	'unwatch',
	'revert',
	'rollback',
	'markpatrolled',
	'info',
	'credits'
];

foreach ($actions as $action) {
	$wgActionPaths[$action] = "${wgArticlePath}?action=$action";
}
```

You can edit the list of actions to include whatever actions you like, but that should cover most of them. You can also edit the URL to whatever you like.

## Diff Pages

Lastly, you might notice that `diff` pages are quite ugly. Certain pages are a little more difficult to get right, and may require you to create a custom function or work with MediaWiki hooks. In our case, you can add the following to your `LocalSettings.php`:  
```
function prettyDiffURLs($title, &$url, $query) {
	if( preg_match('/diff=(\w+)&oldid=(\w+)/', $query, $matches) ) {
		$dbkey = wfUrlencode($title->getPrefixedDBkey());
		$url = "/w/$dbkey?$matches[0]";
	}

	return true;
}
$wgHooks['GetLocalURL::Internal'][] = 'prettyDiffURLs';
```
Again, modify this to match whatever URL schema you prefer.

Note that this doesn't seem to affect diff pages viewed via the Revision Slider extension, but it will work for diffs viewed normally, such as from the watchlist page.

That's it!

## Adding AntiSpoof Extension

You may or may not want to add the [AntiSpoof extension](https://www.mediawiki.org/wiki/Extension:AntiSpoof). This extension prevents users from spoofing existing usernames. If you only have a single wiki, then just follow the [installation instructions](https://www.mediawiki.org/wiki/Extension:AntiSpoof#Installation) as normal. However, if you have a wiki family, you'll need to do just a little bit more.

Start by following the AntiSpoof instructions until it mentions shared databases. Then follow these instructions:

Add 'spoofuser' to `$wgSharedTables` in `LocalSettings.php` like so:
```
$wgSharedTables = array_merge( $wgSharedTables, ['user', 'user_properties', 'user_autocreate_serial', 'actor', 'spoofuser'] );
```

In your database software, make the following changes:
```
GRANT ALL PRIVILEGES on main.spoofuser to 'newwikiadmin'@'localhost';
```

You need to grant these privileges for the `main.spoofuser` table to all database users of your wiki family.

Once you are done, save and exit:
```
FLUSH PRIVILEGES;
EXIT;
```

From here, you can follow the rest of the AntiSpoof extension instructions as normal.

## Adding GlobalCssJs Extension

This extension allows you to put global CSS in `MediaWiki:Global.css` on your main wiki and have it apply to all wikis in your wiki family. Each wiki's `MediaWiki:Common.css` will also override `Global.css`, which is really nice. First, install the extension as you would normally install any extension.

Now add the following to `LocalSettings.php`:
```
$wgUseGlobalSiteCssJs = true;

$wgGlobalCssJsConfig = [
	'wiki' => 'main',
	'source' => 'main',
];

$wgResourceLoaderSources['main'] = array(
	'apiScript' => 'https://your.site.wiki/api.php',
	'loadScript' => 'https://your.site.wiki/load.php'
);
```

You may also have to set the proper database permissions on each wiki in your family:
```
GRANT SELECT on main.page to 'newwikiadmin'@'localhost';
```

That's it!

## Updating and Maintaining Your Wikis

If you have a wiki family, you will need to keep the following in mind when updating or running maintenance scripts:

* When updating, you must always update your main wiki first (the one with the shared user tables).
* In order to do this, you can use the regular maintenance script instructions, but you must supply the `--wiki=<wikiID>` parameter to the command.
* Once your main wiki is updated, then you can update the rest of your wikis in turn, providing their wiki ID each time.

## The End

You've now set up at least one wiki, with all of the wikis sharing the same users but being otherwise independent, each with the URL schema that you chose. Congratulations!

All of this information was collated from various sources, some of it from the official MediaWiki manuals, and other bits from random other places on the internet. Hopefully this helped you if you couldn't figure out how to set up a wiki on your own.

Thanks for reading!