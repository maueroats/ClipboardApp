<template>
	<div class="events">
		<div v-if="eventsAvailable">
			<div v-for="event in events">
				<event-listing :event="event"></event-listing>
			</div>
		</div>
		<div v-else class="no-event-message">
			<span>No events available, please adjust your search filter.</span>
		</div>
        <button @click="turnPage($event, 'down', 0)">page down</button>
        <button @click="turnPage($event, 'up', 0)">page up</button>
	</div>
</template>

<script>
	import EventListing from '~/components/EventListing.vue';
	export default{
		props: ['events'],
		computed: {
			eventsAvailable: function() {
				return this.events.length > 0;
			}
        },
        methods: {
            turnPage: function(event, direction, pageNum) {
                console.log(`child: ${direction}, ${pageNum}`)
                this.$emit("childTurnPage", direction, pageNum)
            }

        },
		components: {
			EventListing
		}
	};
</script>