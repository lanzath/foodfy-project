const db = require('../../config/db');
const { date } = require('../../lib/utils');

module.exports = {
    all() {
        return db.query(`SELECT * FROM chefs ORDER BY name ASC`);
    },
    create(data, fileId) {
        const query = `
        INSERT INTO chefs (
            name,
            created_at,
            file_id
        ) VALUES ($1, $2, $3)
        RETURNING id
        `;

        const values = [
            data.name,
            date(Date.now()).iso, // é necessário enviar data no formato yyyy-mm-dd para o db
            fileId
        ];

        return db.query(query, values);
    },
    find(id) {
        return db.query(`SELECT chefs.*, count(recipes) AS total_recipes
        FROM chefs
        LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
        WHERE chefs.id = $1
        GROUP BY chefs.id
        `, [id]);
    },
    update(data, fileId) {
        if (fileId) {
            const query = `
                UPDATE chefs SET
                name = ($1),
                file_id = ($2)
                WHERE id = $3
            `;

            const values = [
                data.name,
                fileId,
                data.id
            ];

            return db.query(query, values);

        } else {
            const query = `
                UPDATE chefs SET
                name = ($1)
                WHERE id = $2
            `;

            const values = [
                data.name,
                data.id
            ];

            return db.query(query, values);
        }
    },
    delete(id, callback) {
        db.query(`DELETE FROM chefs WHERE id = $1`, [id], function(err, results) {
            if (err) throw `database error! ${err.message}`;

            callback();
        });
    },
    showRecipes(id) {
        return db.query(`
        SELECT recipes.*
        FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        WHERE chefs.id = $1`, [id]);
    },
    file(id) {
        return db.query(`SELECT * FROM files WHERE id = $1`, [id]);
    }
}