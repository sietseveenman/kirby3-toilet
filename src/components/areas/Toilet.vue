<style lang="scss">
    :root {
        --borderColor: rgba(0,0,0,0.12);
    }
    .k-toilet-view {
        padding: 20px 60px;
    }
    .container {
        width: 100%;
        max-width: 820px;
    }
    .header {
        margin: 20px 0;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }
    .flush {
        display: flex;
        column-gap: 5px;
        font-weight: 600;
        opacity: 0.5;
        transition: 0.2s ease-in-out;
        &:hover {
            opacity: 1;
            .icon {
                transform: rotate(2turn);
            }
        }
        .icon {
            transition: 0.8s ease-in-out;
        }
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
        max-width: 160px;
        min-width: 160px;
        padding: 13px 14px 10px;
        border-right: 1px dashed var(--borderColor);
        background-color: rgba(black,0.01);
        
        display: flex;
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
            <div class="container">

                <div class="header">
                    <k-headline size="large">Don't forget to wash your hands</k-headline>
                    <button class="flush" @click="flush" v-show="parsedDumps.length > 1">
                        <k-icon type="refresh" class="icon"/> Flush
                    </button>
                </div>
                
                <div v-for="(dump, index) in parsedDumps" :key="dump.timestamp" class="dump">
                    <div class="meta">
                        <k-text size="tiny" class="timestamp">
                            <k-icon type="clock" class="icon"/><span>{{ dump.time }}</span>
                        </k-text>
                        <button class="remove" @click="removeDump(dump.timestamp)">
                            <k-icon type="remove"/>
                        </button>
                    </div>
                    <div class="print">
                        <k-headline v-if="dump.label" class="label">{{ dump.label }}</k-headline>
                        <div v-html="dump.fecal_matter" :data-index="index" ref="dump">
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
        timeout: Number,
        muted: Boolean,
    },

    computed: {
        parsedDumps() { return this.dumps.map( d => JSON.parse(d) ).reverse() }
    },

    data() {
        return {
            dumpTimeout: null,
            firstDump: true,
            dumps: [],
            dump: null,
            ready: false,
            sfDump: null,
            triggered: [],
            flushSound: new Audio('/media/plugins/sietseveenman/kirby3-toilet/flush.mp3'),
            farts: [
                new Audio('/media/plugins/sietseveenman/kirby3-toilet/fart-1.mp3'),
                new Audio('/media/plugins/sietseveenman/kirby3-toilet/fart-2.mp3'),
                new Audio('/media/plugins/sietseveenman/kirby3-toilet/fart-3.mp3'),
                new Audio('/media/plugins/sietseveenman/kirby3-toilet/fart-4.mp3'),
                new Audio('/media/plugins/sietseveenman/kirby3-toilet/fart-5.mp3'),
                new Audio('/media/plugins/sietseveenman/kirby3-toilet/fart-6.mp3')
            ]
        }
    },

    mounted() {
        this.sfDump = sfdump(document)
        this.addStyles()
        this.receiveDumps()
    },

    destroyed() { clearTimeout(this.dumpTimeout) },

    methods: {
        addStyles() {
            let style = document.createElement('style')
            style.innerText = 'pre.sf-dump .sf-dump-compact, .sf-dump-str-collapse .sf-dump-str-collapse, .sf-dump-str-expand .sf-dump-str-expand { display: none; }'
            document.head.append(style)
        },

        flush() {
            this.$api.post('flush')
            .then(res => {
                if( res.success ) {
                    if ( ! this.muted ) this.flushSound?.play()
                    this.dumps.splice(0)
                }
                else {
                    console.err('Something went wrong flushing')
                }
            })
            .catch(err => {console.err(err)})
        },

        removeDump(timestamp) {
            this.$api.post('remove-dump/'+timestamp)
            .then(res => {
               if ( res.success ) {
                    const dumpIndex = this.dumps.map(d=>JSON.parse(d).timestamp).indexOf(timestamp)
                    this.dumps.splice(dumpIndex, 1)
               }
               else {
                    console.err('Something went wrong removing: ',JSON.parse(this.dumps.dumpIndex))
               }
            })
            .catch(err => {console.err(err)})
        },
        
        receiveDumps() {
            this.dumpTimeout = setTimeout(() => {
                console.log('check')
                this.$api.get('receive-fresh-dumps', this.firstDump ? { initial:true } : {})
                .then(res => {

                    this.firstDump = false
                    if ( res.dumps?.length ) {

                        res.dumps.forEach( dump => this.dumps.push(dump) )
                        this.$nextTick(this.triggerDumps)

                        if ( ! this.muted ) {
                            this.farts[Math.floor(Math.random()*this.farts.length)].play()
                                .then().catch(err => console.info('Not alowed to play sound yet:', err))
                        }
                    }
                    this.receiveDumps()
                })
                .catch(err => { console.err(err) })
            }, this.firstDump ? 50 : this.timeout)
        },
 
        triggerDumps() {
            const dumpDivs = this.$refs.dump
            if (! dumpDivs) return

            dumpDivs.forEach(el => {
                const dumpEl = el.querySelector('.sf-dump[id]')
                const id = dumpEl.id

                if ( this.triggered.includes(id) ) return
                
                this.sfDump(id)
                this.triggered.push(id)
            })
        },
    }
}
</script>