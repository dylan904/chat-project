<template>
    <div class="host">
        <div class="loading loading-0"></div>
        <div class="loading loading-1"></div>
        <div class="loading loading-2"></div>
    </div>
</template>

<style scoped>
.host {
    display: flex;
    gap: 5px;
    padding: 4px 0;
}
.loading {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background: #001858;
}
.loading-0 {
    animation: bounce 1s infinite;
    animation-delay: 0.1s;
}
.loading-1 {
    animation: bounce 1s infinite;
    animation-delay: 0.3s;
}
.loading-2 {
    animation: bounce 1s infinite;
    animation-delay: 0.5s;
}
@keyframes bounce {
    0%, 100% {
        opacity: 1;
    }
    60% {
        opacity: 0;
        transform: scale(0.85);
    }
}
</style>