#!/usr/bin/env bash
# Creates the three DynamoDB tables. Usage: AWS_REGION=eu-west-1 ./scripts/create-tables.sh
set -e

aws dynamodb create-table --table-name Users \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table --table-name Products \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=sellerId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes 'IndexName=seller-index,KeySchema=[{AttributeName=sellerId,KeyType=HASH}],Projection={ProjectionType=ALL}' \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table --table-name Orders \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=buyerId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes 'IndexName=buyer-index,KeySchema=[{AttributeName=buyerId,KeyType=HASH}],Projection={ProjectionType=ALL}' \
  --billing-mode PAY_PER_REQUEST
