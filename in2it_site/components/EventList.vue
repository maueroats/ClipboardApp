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
        <div style="text-align: center">
            <button @click="turnPage($event, 'down', 0)">page down</button>
            <div style="display: inline-block" v-for="num in pageNums">
                <page-button @goToPage='turnPage' :currentPageNum='currentPageNum' :number='num'></page-button>
            </div>
            <button @click="turnPage($event, 'up', 0)">page up</button>
        </div>
	</div>
</template>

<script>
    import EventListing from '~/components/EventListing.vue';
    import PageButton from '~/components/PageButton.vue';
	export default{
		props: ['events', 'currentPageNum', 'pageNums'],
		computed: {
			eventsAvailable: function() {
				return this.events.length > 0;
			}
        },
        methods: {
            turnPage: function(event, direction, pageNum) {
                this.$emit("turnPage", direction, pageNum)
            }

        },
		components: {
            EventListing,
            PageButton
		}
	};
</script>