<style lang="scss">
    :root {
        --borderColor: rgba(0,0,0,0.12);
    }
    .k-toilet-view {
        padding: 40px;
    }
    .container {
        margin: 20px auto;
    }
    .dump {
        display: flex;
        border: 1px solid var(--borderColor);
        border-radius: 6px;
        &:not(:last-child) {
            border-bottom: 0px;
        }
    }
    .meta {
        width: 15%;
        max-width: 190px;
        padding: 13px 14px 10px;
        border-right: 1px dashed var(--borderColor);
        background-color: rgba(black,0.01);
        
        display: flex;
        // flex-direction: column;
        justify-content: space-between;
        align-items: baseline;

        .remove {
            margin-left: auto;
            transform: scale(0.9);
            opacity: 0.3;
            transition: 0.2s ease-in-out;
            &:hover {
                opacity: 1;
            }
        }
    }
    .label, .timestamp {
        color: rgba(black,0.7);
        font-size: 14px;
        padding-bottom: 0.2em;
    }
    .timestamp {
        display: flex;
        column-gap: 0.5em;
        .icon {
            transform: scale(0.8);
        }
    }
    .print {
        padding: 12px 14px 10px;
        flex-grow: 1;
    }
    pre.sf-dump {
        width: 100%;
        font-size: 13px !important;
        line-height: 1.25 !important;
        background-color: transparent !important;
    }
</style>

<template>
    <k-inside>
        <k-view class="k-toilet-view">
            
            <k-headline size="large">Don't forget to flush</k-headline>
            
            <div class="container">
                <div v-for="(entry, index) in dumpObjects" :key="index" class="dump">
                    <div class="meta">
                        <k-text size="tiny" class="timestamp">
                            <k-icon type="clock" class="icon"/><span>{{ entry.timestamp }}</span>
                        </k-text>
                        <button class="remove" @click="remove(index)">
                            <k-icon type="remove"/>
                        </button>
                    </div>
                    <div class="print">
                        <k-headline v-if="entry.label" class="label">{{ entry.label }}</k-headline>
                        <div v-html="entry.dump" :data-index="index" ref="dumps">
                        </div>
                    </div>
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
    computed: {
        dumpObjects() {
            return this.dumps.map( d => JSON.parse(d) )
        }
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
        // this.dumps = this.dumps.reverse()
        console.log(this.dumpObjects);

        this.sfDump = sfdump(document);
        this.triggerDumps();
        let style = document.createElement('style')
        style.innerText = 'pre.sf-dump .sf-dump-compact, .sf-dump-str-collapse .sf-dump-str-collapse, .sf-dump-str-expand .sf-dump-str-expand { display: none; }'
        document.head.append(style)
    },
    methods: {

        remove(i) {
            this.dumps.splice(i, 1)
        },
 
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