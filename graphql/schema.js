// schema.js
import { gql } from "graphql-tag";
import { sql } from '../config/db.js';

export const typeDefs = gql`

	type Continent {
		code: String!
		name: String!
		countries: [Country!]!
	}

	type Country {
		code: String!
		name: String!
		full_name: String
		iso3: String
		iso_number: Int
		continent: Continent!
	}

	type Query {
		continents: [Continent!]!
		continent(code: String!): Continent
		countries: [Country!]!
		country(code: String!): Country
		countriesByContinent(continentCode: String!): [Country!]!
	}

	type Mutation {
		createCountry(
			code: String!
			name: String!
			full_name: String!
			iso3: String!
			iso_number: Int!
			continent: String!
		): Country!

		updateCountry(
			code: String!
			name: String
			full_name: String
			iso3: String
			iso_number: Int
			continent: String
		): Country!

		deleteCountry(code: String!): Country!
	}
`;

export const resolvers = {
    Query: {
        continents: async () => {
            return await sql`SELECT * FROM continent`;
        },

        continent: async ({ code }) => {
            const [continent] = await sql`SELECT * FROM continent WHERE code = ${code.toUpperCase()}`;
            return continent;
        },

        countries: async () => {
            return await sql`SELECT * FROM country`;
        },

        country: async ({ code }) => {
            const [country] = await sql`SELECT * FROM country WHERE code = ${code.toUpperCase()}`;
            return country;
        },

        countriesByContinent: async ({ continentCode }) => {
            return await sql`SELECT * FROM country WHERE continent = ${continentCode.toUpperCase()}`;
        },
    },

    Mutation: {

        // Mutation resolvers
        createCountry: async ({ code, name, full_name, iso3, iso_number, continent }) => {
            const [result] = await sql`
            INSERT INTO country (code, name, full_name, iso3, iso_number, continent)
            VALUES (${code}, ${name}, ${full_name}, ${iso3}, ${iso_number}, ${continent})
            RETURNING *
            `;
            return result;
        },

        updateCountry: async ({ code, name, full_name, iso3, iso_number, continent }) => {
            // Get current country
            const [current] = await sql`SELECT * FROM country WHERE code = ${code.toUpperCase()}`;

            if (!current) {
                throw new Error('Country not found');
            }

            // Merge with updates
            const updated = {
                name: name ?? current.name,
                full_name: full_name ?? current.full_name,
                iso3: iso3 ?? current.iso3,
                iso_number: iso_number ?? current.iso_number,
                continent: continent ?? current.continent
            };

            const [result] = await sql`
                UPDATE country
                SET name = ${updated.name}, 
                    full_name = ${updated.full_name}, 
                    iso3 = ${updated.iso3}, 
                    iso_number = ${updated.iso_number}, 
                    continent = ${updated.continent}
                WHERE code = ${code.toUpperCase()}
                RETURNING *
                `;

            return result;
        },

        deleteCountry: async ({ code }) => {
            const [deleted] = await sql`
                DELETE FROM country
                WHERE code = ${code.toUpperCase()}
                RETURNING *
                `;

            if (!deleted) {
                throw new Error('Country not found');
            }

            return deleted;
        }

    },
    Country: {
        continent: async (parent) => {
            const [continent] = await sql`SELECT * FROM continent WHERE code = ${parent.continent}`;
            return continent;
        }
    },
    Continent: {
        countries: async (parent) => {
            return await sql`SELECT * FROM country WHERE continent = ${parent.code}`;
        }
    }
};

