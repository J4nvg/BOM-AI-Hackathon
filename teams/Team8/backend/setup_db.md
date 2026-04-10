

## Using docker
Start container
```bash
docker run --name bom_db -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:latest
```

Setup schema
```bash
docker exec -i bom_db mysql -uroot -ppassword < db.sql
```


