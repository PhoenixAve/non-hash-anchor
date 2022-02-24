import { debounce, throttle } from 'lodash-es';
import ResizeObserver from 'resize-observer-polyfill';
// @ts-ignore
import { version } from '../package.json';

// 保存元素的位置信息及是否处于暴露状态
declare interface AnchorPosition {
  top: number;
  bottom: number;
}

declare type OnChange = (anchor?: string) => void;
declare type OnExposure = (anchors?: string[]) => void;

declare interface AnchorOptions {
  scrollContainer?: HTMLElement;
  offsetTop?: number;
  isDynamic?: boolean;
  onChange?: OnChange;
  onExposure?: OnExposure;
}

const defaultScrollContainer = document.documentElement || document.body

const defaultOptions: AnchorOptions = {
  scrollContainer: defaultScrollContainer,
  offsetTop: 0,
  isDynamic: false,
  onChange: () => { },
  onExposure: () => { },
};

export default class Anchor {
  private static version: string = version;
  // 外层容器
  private container: HTMLElement;
  // 滚动容器，默认为body
  private scrollContainer: HTMLElement = defaultScrollContainer;
  private scrollEventElement: HTMLElement | Window = window;
  private anchorItemList: HTMLElement[] = [];
  private anchorInfoMap: Map<string, AnchorPosition> = new Map();
  // 元素滚动的距离
  private scrollTop = 0;
  // 滚动元素scrollContainer的高度
  private clientHeight = 0;
  // 滚动停止后距离scrollContainer顶部的距离
  private offsetTop = 0;
  // 列表是否会动态增删
  private isDynamic = false;
  // 锚点元素容器顶部距离滚动容器的距离
  private scrollOffsetTop = 0;
  private activeOffsetTop = 0;
  // 当前命中的锚点
  private activeAnchor = '';
  // 监听container容器变化的实例
  private resizeObserver: ResizeObserver | null = null;
  private onChange: OnChange;
  private onExposure: OnExposure;
  // 增加节流后的校验元素是否暴露在窗口的函数
  private throttleCheckExposure: EventListenerOrEventListenerObject | undefined;
  private isExposureList: string[] = [];
  constructor(
    container: HTMLElement,
    options?: AnchorOptions
  ) {
    // 合并默认配置
    options = Object.assign(defaultOptions, options);
    this.container = container;
    this.scrollContainer = options.scrollContainer as HTMLElement;
    this.offsetTop = options.offsetTop as number;
    this.isDynamic = options.isDynamic as boolean;
    this.onChange = options.onChange as OnChange;
    this.onExposure = options.onExposure as OnExposure;
    if (!this.container) {
      return;
    }
    this.scrollEventElement = this.scrollContainer
    if (this.scrollContainer === defaultScrollContainer) {
      // 因为html/body不支持滚动事件，所以需要用window来处理滚动事件
      this.scrollEventElement = window
    }
    this.clientHeight = this.scrollContainer.clientHeight;
    this.throttleCheckExposure = throttle(
      this.checkExposure, 100
    ) as EventListenerOrEventListenerObject;
    this.init();
  }
  /**
   * 获取所有被锚的元素
   */
  private getAnchorItem() {
    if (this.isDynamic || !this.anchorItemList.length) {
      // 如果列表会动态变化，或者列表为空，则获取列表
      this.anchorItemList =
        (this.container.querySelectorAll('[data-anchor]') as unknown as HTMLElement[]) || [];
    }
  }
  /**
   * 获取所有被锚的元素的位置
   */
  private getAnchorItemPosition() {
    // 默认第一个元素距离浏览器顶端的高度
    let itemTop = 0;
    const scrollContainerTop = this.scrollContainer.getBoundingClientRect().top;

    let itemBottom = itemTop;
    let preAnchorRect: DOMRect | undefined;
    this.anchorItemList.forEach((item, index) => {
      const curAnchorRect = item.getBoundingClientRect();
      if (preAnchorRect) {
        // 加上每个元素中间的差距
        itemTop = itemBottom + Math.abs(curAnchorRect.top - preAnchorRect.bottom);
      } else {
        // 计算锚点列表第一个元素距离滚动元素上方的距离
        itemTop = curAnchorRect.top - scrollContainerTop
      }
      preAnchorRect = curAnchorRect;
      itemBottom = itemTop + curAnchorRect.height;
      this.anchorInfoMap.set(item.dataset.anchor || '' + index, {
        top: itemTop + this.scrollOffsetTop,
        bottom: itemBottom,
      });
    });
  }
  public restart() {
    this.destroy();
    this.init();
  }
  private init() {
    // 获取列表每一项，放到这里，是因为可能元素会被动态添加或者删除
    this.getAnchorItem();
    // 获取每一项的位置信息
    this.getAnchorItemPosition();
    // 检查元素是否处于曝光状态
    this.checkExposure();
    this.bindEvent();
  }
  private bindEvent() {
    this.scrollEventElement.addEventListener(
      'scroll',
      this.throttleCheckExposure as EventListenerOrEventListenerObject, {
      passive: true
    });
    const debounceFn = debounce(() => {
      // 当容器高度发生变化时，说明子元素高度发生了变化，需要重新获取每一项的位置信息
      this.getAnchorItem();
      this.getAnchorItemPosition();
      // 重新检测曝光状态
      this.checkExposure();
    }, 100) as ResizeObserverCallback;
    this.resizeObserver = new ResizeObserver(debounceFn);
    this.resizeObserver.observe(this.container as HTMLElement);
  }
  public destroy() {
    // 结束scroll事件
    this.scrollEventElement.removeEventListener(
      'scroll',
      this.throttleCheckExposure as EventListenerOrEventListenerObject,
    );
    // 结束元素的监听
    this.resizeObserver && this.resizeObserver.unobserve(this.container as HTMLElement);
  }
  /**
   * 滚动到某个锚点
   * @param anchor
   */
  public scrollTo(anchor: string) {
    const targetTop =
      (this.anchorInfoMap.get(anchor)?.top || 0) - this.offsetTop - this.activeOffsetTop + 1;
    this.scrollContainer.scrollTo({
      left: 0,
      top: targetTop,
      behavior: 'smooth',
    });
  }
  /**
   * 检验元素是否处于曝光状态
   */
  private checkExposure = () => {
    // 获取元素滚动距离
    this.scrollTop = Math.abs(this.scrollContainer.scrollTop || 0);
    const isExposureList: string[] = [];
    this.anchorInfoMap.forEach((item, key) => {
      if (this.isExposure(item)) {
        isExposureList.push(key);
      }
      if (this.isActive(item) && this.activeAnchor !== key) {
        this.activeAnchor = key;
        this.onChange(key);
      }
    });
    if (isExposureList.length && !this.isSameContent(this.isExposureList, isExposureList)) {
      // 数组内容变化时才向上
      this.onExposure(isExposureList);
      this.isExposureList = isExposureList;
    }
  };
  /**
   * 两个数组内容是否一致，与顺序无关
   * @param pre
   * @param next
   * @returns
   */
  private isSameContent(pre: string[], next: string[]) {
    if (pre.length !== next.length) return false;
    if (JSON.stringify(pre.sort()) === JSON.stringify(next.sort())) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * 判断当前模块是否处于active状态
   * @param position
   * @returns
   */
  private isActive(position: AnchorPosition): boolean {
    return (
      position.top <= this.scrollTop + this.offsetTop + this.activeOffsetTop &&
      position.bottom >= this.scrollTop - this.scrollOffsetTop
    );
  }
  /**
   * 检测某个模块是否处于曝光状态
   * @param position
   * @returns
   */
  private isExposure(position: AnchorPosition): boolean {
    return (
      position.top < this.scrollTop + this.clientHeight + this.activeOffsetTop &&
      position.bottom > this.scrollTop - this.scrollOffsetTop
    );
  }
}
