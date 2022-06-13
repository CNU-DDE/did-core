#!/bin/bash

mongo -- "$MONGO_INITDB_DATABASE" <<EOF
    const admin = db.getSiblingDB('admin');
    admin.auth("$MONGO_INITDB_ROOT_USERNAME", "$MONGO_INITDB_ROOT_PASSWORD");

    db.createUser(
        {
            user: "$MONGO_INITDB_USERNAME",
            pwd: "$MONGO_INITDB_PASSWORD",
            roles: [
                {
                    role: "readWrite",
                    db: "$MONGO_INITDB_DATABASE"
                }
            ]
        }
    );
EOF
