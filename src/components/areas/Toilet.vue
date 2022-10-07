<style>
    .k-toilet-view {
        padding: 50px;
    }
    .dump {
        margin: 25px auto;
    }
    .dump .sf-dump {
        padding: 15px 18px;
    }
</style>

<template>
    <k-inside>
        <k-view class="k-toilet-view">
            <k-headline size="large">Don't forget to flush</k-headline>
            <div v-for="(dump, index) in dumps" :key="index" class="dump">
                <div v-html="dump" :data-index="index" ref="dumps">
                </div>
            </div>
           
        </k-view>
    </k-inside>
</template>

<script>

import sfdump from '../../lib/sfdump.js'

export default {
    props: {
        headline: String,
        dumps: Array,
    },
    data() {
        return {
            dump: null,
            entries: [],
            ready: false,
            newEntriesTimeout: null,
            newEntriesTimer: 2000,
            recordingStatus: 'enabled',
            sfDump: null,
            triggered: [],
        };
    },
    mounted() {
        this.sfDump = sfdump(document);
        this.triggerDumps();
        let style = document.createElement('style')
        style.innerText = 'pre.sf-dump .sf-dump-compact, .sf-dump-str-collapse .sf-dump-str-collapse, .sf-dump-str-expand .sf-dump-str-expand { display: none; }'
        document.head.append(style)
    },
    methods: {
        /**
         * Trigger the Sfdump() for every newly dumped <pre> tag.
         */
        triggerDumps() {
            const divs = this.$refs.dumps;

            if (! divs) return;

            divs.forEach(el => {
            
                const id = el.querySelector('.sf-dump[id]').id;
             
                if (this.triggered.includes(id)) return;

                this.sfDump(id);
                this.triggered.push(id);
            });
        }
    }
}
</script>