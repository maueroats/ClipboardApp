<template>
    <button v-bind:style="{ color: textColor }" @click="goToPage">{{number}}</button>
</template>
<script>
    export default {
        props: ['number', 'currentPageNum'],
        methods: {
            goToPage: function(){
                this.$emit("goToPage", 'placeholder', 'placeholder', this.number);
            }
        },
        computed: {
            textColor: function(){
                return this.number === this.currentPageNum ? 'green' : 'buttontext';
            }
        }
    }
</script>