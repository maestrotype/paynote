#!/bin/bash

#mkdir /var/www/html/portal.schex/seamlesschex3.0/api/storage/signature
#chmod -R 777 /var/www/html/portal.schex/seamlesschex3.0/api/storage/signature

#chown -R ec2-user:ec2-user /var/www/html/portal.schex/
#chmod -R 777 /var/www/html/portal.schex/seamlesschex3.0/api/storage/logs/
#chmod -R 777 /var/www/html/portal.schex/seamlesschex3.0/api/storage/framework/views/

if [ "$DEPLOYMENT_GROUP_NAME" == "prod-paynote" ]
then
  echo You may not go to the party.
  #cd /var/www/html/portal.schex/seamlesschex3.0/api
  #php artisan --env=production migrate --database=mysql
  #php artisan --env=production migrate --database=mysql_sandbox

  #rm -rf /var/www/html/demo-sandbox.schex
  #cp -R /var/www/html/portal.schex/seamlesschex3.0 /var/www/html/demo-sandbox.schex/
  #chown -R ec2-user:ec2-user /var/www/html/demo-sandbox.schex/

  #cd /var/www/html/demo-sandbox.schex/seamlesschex3.0/api
  #php artisan --env=demo migrate --database=mysql
  #php artisan --env=demo migrate --database=mysql_sandbox
  
elif [ "$DEPLOYMENT_GROUP_NAME" == "dev-paynote" ]
then
  echo You may not go to the party.
  #cd /var/www/html/portal.schex/seamlesschex3.0/api
  #php artisan --env=dev_portal migrate --database=mysql
  #php artisan --env=dev_portal migrate --database=mysql_sandbox
else
  echo You may not go to the party.
fi
