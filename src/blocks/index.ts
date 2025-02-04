import { CardComponent } from "./CardComponent";
import { DynamicCSSComponent } from "./DynamicCSSComponent";
import { DynamicIframeComponent } from "./DynamicIframeComponent";
import { FeishuChatComponent } from "./FeishuchatComponent";
import { MacroComponent } from "./MacroComponent";
import { MetaInfoComponent } from "./MetaInfoComponent";
import { QQBlock } from "./qq";
import { SiphanComponent } from "./SiphanComponent";
import { SwiperComponent } from "./SwiperComponent";
import { WechatBlock } from "./wechat";

export const EnabledBlocks = [
	SiphanComponent,
	CardComponent,
	QQBlock,
	WechatBlock,
	FeishuChatComponent,
	SwiperComponent,
	DynamicCSSComponent,
	DynamicIframeComponent,
    MacroComponent,
	MetaInfoComponent
];
