import { loadRemoteCss, loadRemoteJs } from "src/utils";

export function loadRemoteResource() {
    return;
    loadRemoteCss(
    	"https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.13/theme-chalk/index.css"
    );
    loadRemoteCss(
    	"https://cdn.bootcdn.net/ajax/libs/Swiper/3.4.2/css/swiper.min.css"
    );
    loadRemoteJs("https://cdn.bootcdn.net/ajax/libs/vue/2.6.14/vue.min.js");
    loadRemoteJs(
    	"https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.13/index.min.js"
    );
    loadRemoteJs(
    	"https://cdn.bootcdn.net/ajax/libs/Swiper/3.4.2/js/swiper.min.js"
    );
}