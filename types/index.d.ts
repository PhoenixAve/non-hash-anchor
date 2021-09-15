declare type OnChange = (anchor?: string) => void;
declare type OnExposure = (anchors?: string[]) => void;
declare interface AnchorOptions {
    scrollContainer?: HTMLElement;
    offsetTop?: number;
    isDynamic?: boolean;
    onChange?: OnChange;
    onExposure?: OnExposure;
}
export default class Anchor {
    private static version;
    private container;
    private scrollContainer;
    private scrollEventElement;
    private anchorItemList;
    private anchorInfoMap;
    private scrollTop;
    private clientHeight;
    private offsetTop;
    private isDynamic;
    private scrollOffsetTop;
    private activeOffsetTop;
    private activeAnchor;
    private resizeObserver;
    private onChange;
    private onExposure;
    private throttleCheckExposure;
    private isExposureList;
    constructor(container: HTMLElement, options?: AnchorOptions);
    /**
     * 获取所有被锚的元素
     */
    private getAnchorItem;
    /**
     * 获取所有被锚的元素的位置
     */
    private getAnchorItemPosition;
    restart(): void;
    private init;
    private bindEvent;
    destroy(): void;
    /**
     * 滚动到某个锚点
     * @param anchor
     */
    scrollTo(anchor: string): void;
    /**
     * 检验元素是否处于曝光状态
     */
    private checkExposure;
    /**
     * 两个数组内容是否一致，与顺序无关
     * @param pre
     * @param next
     * @returns
     */
    private isSameContent;
    /**
     * 判断当前模块是否处于active状态
     * @param position
     * @returns
     */
    private isActive;
    /**
     * 检测某个模块是否处于曝光状态
     * @param position
     * @returns
     */
    private isExposure;
}
export {};
