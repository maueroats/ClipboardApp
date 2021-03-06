import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetEventsResponse {
    @ApiModelProperty()
    id: number;

    @ApiModelProperty()
    title: string;

    @ApiModelProperty()
    url: string;

    @ApiModelProperty()
    description: string;

    @ApiModelProperty()
    organization: string;

    @ApiModelProperty()
    price: number;

    @ApiModelProperty()
    startTime: string;

    @ApiModelProperty()
    endTime: string;

    @ApiModelProperty()
    category: string;

    @ApiModelProperty()
    address: string;

    @ApiModelProperty()
    startDate: string;

    @ApiModelProperty()
    endDate: string;

    @Type(() => Number)
    @ApiModelProperty()
    lat: number;
    
    @Type(() => Number)
    @ApiModelProperty()
    lon: number;
}
