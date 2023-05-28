<script setup lang='ts'>
const props = defineProps({
    name: {
        type: String,
        required: true
    },
    startName: {
        type: String,
        required: true
    },
    endName: {
        type: String,
        required: true
    },
    bothway: {
        type: Boolean,
        required: true
    }
})
</script>

<template>
    <div class="name">
        <div class="rela-name">{{ name }}</div>
        <div class="con">
            <div class="start">{{ startName }}</div>
            <t-icon v-if="props.bothway" name="chevron-left" />
            <t-icon name="chevron-right" />
            <div class="end">{{ endName }}</div>
        </div>
    </div>
</template>

<style scoped lang='less'>
.name {
    color: #595959;
    box-shadow: var(--rela-border) 0px 0px 10px;
    border: 1px solid var(--rela-border);
    display: flex;
    flex-direction: column;
    text-align: center;
    margin: 0 8px;
    transition: 0.4s;

    .rela-name {
        background-color: #e6e7eb;
        text-align: center;
    }

    .con {
        padding: 0 10px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: var(--real-con);
    }
}

.name:hover {
    opacity: 0.8;
    transition: 0.4s;
}
</style>