const db = require('../../config/db');
const { hash } = require('bcryptjs'); // password encryption
const fs = require('fs');
const Recipe = require('./Recipe');
const File = require('./File');

module.exports = {
    async all() {
        const results = await db.query('SELECT * FROM users');

        return results.rows;
    },
    async findOne(filters) {
        let query = 'SELECT * FROM users';

        Object.keys(filters).map(key => {
            //WHERE | OR | AND
            query = `${query}
            ${key}
            `;

            Object.keys(filters[key]).map(field => {
                query = `${query} ${field} = '${filters[key][field]}'`
            });
        });

        const results = await db.query(query);

        return results.rows[0];
    },
    async create(data) {
        try {
            const query = `
            INSERT INTO users (
                name,
                email,
                password,
                is_admin
                )VALUES ($1, $2, $3, $4)
                RETURNING id, email
                `;

                if (data.seedPassword) {
                    const values = [
                        data.name,
                        data.email,
                        data.seedPassword,
                        data.is_admin || false,
                    ];
                }

                // random password generate
                let randomPassword = Math.random().toString(36).slice(-5);
                const passwordHash = await hash(randomPassword, 8);

                let values = [
                    data.name,
                    data.email,
                    passwordHash,
                    data.is_admin || false,
                ];

                if (data.seedPassword) {
                    values = [
                        data.name,
                        data.email,
                        data.seedPassword,
                        data.is_admin || false
                    ];
                }

                const results = await db.query(query, values);

                return {
                    id: results.rows[0].id,
                    email: results.rows[0].email,
                    password: randomPassword,
                }

            } catch(err) {
                    console.error(err.message);
                }
    },
    async update(id, fields) {
        let query = 'UPDATE users SET';

        Object.keys(fields).map((key, index, array) => {
            if (index+1 < array.length) {
                query = `${query}
                    ${key} = '${fields[key]}',
                `;
            } else {
                query = `${query}
                    ${key} = '${fields[key]}'
                    WHERE id = ${id}
                `;
            }
        });

        await db.query(query);
        return;
    },
    async delete(id) {
        let results = await db.query('SELECT * FROM recipes WHERE user_id = $1', [id]);
        recipes = results.rows;

        recipeFilesRowsPromise = recipes.map(recipe => Recipe.files(recipe.id));

        let files = [];
        let recipeFilesRowsResults = await Promise.all(recipeFilesRowsPromise);
        let recipesRows = recipeFilesRowsResults.map(results => results.rows);
        for (recipe of recipesRows) {
            for (file of recipe) {
                files.push(file);
            }
        }

        const filesPromise = files.map(file => File.find(file.file_id));
        filesPromiseResults = await Promise.all(filesPromise);
        files = filesPromiseResults.map(result => result.rows[0]);

        await db.query('DELETE FROM users WHERE id = $1', [id]);

        // handle files remove (not using cascade on delete)
        files.map(file => {
            try {
                File.delete(file.id);
            }
            catch(err) {
                console.error(err.message)
            }
        });
    }
}
