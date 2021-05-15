const db = require('../../config/db');
const { date } = require('../../lib/utils');

module.exports = {
    all() {
        return db.query(`
        SELECT recipes.*, chefs.name AS chef_name
        FROM recipes
        LEFT JOIN chefs ON(recipes.chef_id = chefs.id)
        ORDER BY created_at DESC
        `);
    },
    create(data) {
        const query = `
            INSERT INTO recipes (
                chef_id,
                title,
                ingredients,
                preparation,
                information,
                created_at,
                user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            date(Date.now()).iso,
            data.user_id
        ];

        return db.query(query, values);
    },

    find(id) {
        return db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
    },

    update(data) {
        const query = `
            UPDATE recipes SET
                chef_id = ($1),
                title = ($2),
                ingredients = ($3),
                preparation = ($4),
                information = ($5)
            WHERE id = $6
        `;

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.id
        ];

        return db.query(query, values);
    },

    delete(id, callback) {
        db.query(`DELETE FROM recipes WHERE id = $1`, [id], function (err, results) {
            if (err) throw `database error! ${err.message}`;
            callback();
        });

    },

    chefsSelectOptions() {
        return db.query(`SELECT name, id FROM chefs ORDER BY name ASC`)
    },

    files(id) {
        return db.query(`SELECT * FROM recipe_files WHERE recipe_id = $1`, [id])
    },
}
