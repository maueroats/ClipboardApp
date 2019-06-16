<template>
	<div>
		<div class="content-row">
			<filters @filterApplied="updateEvents()"></filters>
			<event-list :events="displayedEvents" :currentPageNum="currentPageNum" :pageNums="displayedPageNums" @turnPage="turnPage"></event-list>
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
                currentPageNum: 1,
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
                for(var i = ((this.currentPageNum - 1)* this.eventsPerPage); (i < (this.eventsPerPage * this.currentPageNum) && i < this.events.length); i++){
                    output.push(this.events[i]);
                }
                return output;
            },
            displayedPageNums: function() {
                let output = [1, 2, 3, 4, 5]
                let sz = output.length;
                let totalPages = Math.ceil(this.events.length / this.eventsPerPage)
                if(this.currentPageNum < 4){
                    return output;
                }else if(this.currentPageNum < totalPages - 1){
                    return output.map((num, i) => this.currentPageNum - (Math.floor(sz/2)-i));
                }else{
                    return output.map((num, i) => totalPages - (sz - (i + 1)));
                }
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
                if(pageNum){
                    return this.currentPageNum = pageNum
                }else{
                    if(direction === "up" && this.currentPageNum < Math.ceil(this.events.length / this.eventsPerPage)){
                        this.currentPageNum++;
                    }else if(direction === "down" && this.currentPageNum > 1){
                        this.currentPageNum--;
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
