<template>
	<div>
		<div class="content-row">
			<filters @filterApplied="updateEvents()"></filters>
			<event-list :events="displayedEvents" @childTurnPage="turnPage"></event-list>
		</div>
	</div>	
</template>

<script lang='ts'>
	import axios from 'axios';
	import rest from '@feathersjs/rest-client';
	import feathers from '@feathersjs/feathers';
	import Filters from '~/components/Filters.vue';
	import EventList from '~/components/EventList.vue';
	import { Service } from 'feathersjs__feathers';
	
	import { dummyData } from '~/store/dummyData.js';
	
	function getClient(url: string): Service<any> {
		const app = feathers();
		const restClient = rest('http://' + url);
		app.configure(restClient.axios(axios));
		return app.service('events');
	}

	export default {
		data() {
			return {
                events: [],
                pageNum: 1,
                eventsPerPage: 10
			};
		},
		asyncData ({ app, params }) {
            //Ensure get request goes to an endpoint that returns an array or json object
            //If a regular HTML page is returned, the v-for in the view above will try to
            //render each character in the HTML page string as a separate event and nuxt
			//will run out of memory
            if (process.env.DUMMY_DATA) {
                return { events: dummyData };
			}
			const eventService = getClient('event_service:5000');
			return eventService.find({query: {}})
				.then(res => {
					return { events: res };
				});
        },
        computed: {
            displayedEvents: function(){
                let output = [];
                for(var i = (this.pageNum * this.eventsPerPage); (i < (this.eventsPerPage * (this.pageNum + 1)) && i < this.events.length); i++){
                    output.push(this.events[i]);
                }
                return output;
            }
        },
		methods: {
			updateEvents: function() {
				const eventServiceClient = getClient(this.$env.API_URL || '');
				return eventServiceClient.find({
					query: {
						start_timestamp: this.$store.searchFilter.startDate, 
						end_timestamp: this.$store.searchFilter.endDate,
						miles: this.$store.searchFilter.searchRadius,
						address: this.$store.searchFilter.addressOrZip || '60611'
					}
				})
				.then((res) => {
					this.events = res;
				});
            },
            turnPage(direction, pageNum){
                //  console.log(`the 'direction' parameter equals ${direction} and is a ${typeof direction}`)
                // console.log(`the 'page' parameter equals ${page} and is a ${typeof page}`)
                if(pageNum){
                    console.log("going directly to page");
                    // return this.pageNum = pageNum
                }else{
                    if(direction === "up"){
                        console.log("paging up");
                        this.pageNum++;
                    }else if(direction === "down" && this.pageNum > 1){
                        console.log("paging down");
                        this.pageNum--;
                    }
                }

            }
		},
		components: {
			Filters,
			EventList
		}
	};
</script>
