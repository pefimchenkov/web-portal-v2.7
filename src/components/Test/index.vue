<template>
    <div class="test">
        {{ message }}
    </div>
</template>

<script>
export default {

    data() {
        return {
            message: 'Это тестовый компонент !!!'
        }
    },

    created()  {
        console.log('test component created')
    },


    updated() {
        console.log('test component updated')
    },

    destroyed() {
        console.log('test component destroyed')
    }
}
</script>


<style lang="scss" scoped>
    .test {
        padding: 5px;
        background: lightcyan;
    }
</style>