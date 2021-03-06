import * as knex from 'knex';
import * as knexStringcase from 'knex-stringcase';
import * as _ from 'lodash';
import { GetGeocodeRequest } from 'src/DTO/getGeocodeRequest';
import { GetGeocodeResponse } from 'src/DTO/getGeocodeResponse';
import { CreateGeocodeRequest } from '@src/DTO/createGeocodeRequest';
import { randomExpirationTime } from '@src/utilities';
import { SearchNeighborhoodRequest } from '@src/DTO/searchNeighborhoodRequest';

const db = knex(knexStringcase({
    client: 'postgresql',
    connection: 'postgresql://postgres:postgres@postgres:5432/events',
}));

export class GeocodeDAL {
    async getNeighborhoods(): Promise<Object[]> {
        const result = await db('geocode.location')
                    .distinct('neighborhood')
                    .whereNotNull('neighborhood')
                    .orderBy('neighborhood');

        return result;
    }

    async getAllGeocodes(): Promise<Object[]> {
        const response = await db.select('id', 'address', 'lat', 'lon', 'neighborhood')
            .from('geocode.location');

        return response;
    }

    async getGeocode(params: GetGeocodeRequest): Promise<Object[]> {
        const result = await db.select('id', 'address', 'lat', 'lon', 'neighborhood')
            .from('geocode.location')
            .where('address', params.address);

        return result;
    }

    async searchNeighborhood(params: SearchNeighborhoodRequest): Promise<Object[]> {
        const result = await db.select('id', 'address', 'lat', 'lon', 'neighborhood')
            .from('geocode.location')
            .where('neighborhood', params.neighborhood);

        return result;
    }

    async createGeocode(data: CreateGeocodeRequest): Promise<number> {
        data.expireAt = randomExpirationTime();
        const val = await db('geocode.location').returning('id').insert(data);
        return val[0];
    }

    async deleteAllGeocodes() {
        await db('geocode.location').del();
    }
}
