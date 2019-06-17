#!/bin/bash


if [ "$DEPLOYMENT_GROUP_NAME" == "prod-paynote" ]
then
  echo You may not go to the party.
#  mysqldump -h schex-v3-live-rds.cpzc0qit1ixo.us-east-1.rds.amazonaws.com -u admin -pChrome09123Y seamlesschex_beta | gzip > /home/ec2-user/dump_seamlesschex_portal.sql.gz
#  mysqldump -h schex-v3-live-rds.cpzc0qit1ixo.us-east-1.rds.amazonaws.com -u admin -pChrome09123Y seamlesschex_sandbox | gzip > /home/ec2-user/dump_seamlesschex_sandbox.sql.gz  
elif [ "$DEPLOYMENT_GROUP_NAME" == "dev-paynote" ]
then
  echo You may not go to the party.
#  mysqldump -h schex-v3-live-rds.cpzc0qit1ixo.us-east-1.rds.amazonaws.com -u admin -pChrome09123Y schex_dev_beta | gzip > /home/ec2-user/dump_seamlesschex_dev_portal.sql.gz  
else
  echo You may not go to the party.
fi

rm -rf /var/www/html/paynote-client
rm -rf /var/www/html/paynote-client-sandbox