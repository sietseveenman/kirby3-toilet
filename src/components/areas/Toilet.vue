<template>
    <k-inside>
        <k-view>
            
            <h1>Don't forget to flush</h1>

        </k-view>
    </k-inside>
</template>

<script>
export default {
    props: {
        headline: String
    },
    mounted() {
        console.log('eyoo')
    }
}
</script>