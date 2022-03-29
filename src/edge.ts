import { Container } from '@pixi/display';
import { InteractionEvent } from '@pixi/interaction';
import { IPointData } from '@pixi/math';
import { TypedEmitter } from 'tiny-typed-emitter';
import { createEdge, updateEdgeStyle, updateEdgeVisibility } from './renderers/edge';
import { createEdgeArrow, updateEdgeArrowStyle, updateEdgeArrowVisibility } from './renderers/edge-arrow';
import { createEdgeLabel, updateEdgeLabelStyle, updateEdgeLabelVisibility } from './renderers/edge-label';
import { EdgeStyle, NodeStyle } from './utils/style';
import { TextureCache } from './texture-cache';
import { GraphStyleDefinition } from './utils/style';

interface PixiEdgeEvents {
  mousemove: (event: MouseEvent) => void;
  mouseover: (event: MouseEvent) => void;
  mouseout: (event: MouseEvent) => void;
  mousedown: (event: MouseEvent) => void;
  mouseup: (event: MouseEvent) => void;
  rightclick: (event: MouseEvent) => void;
}

export class PixiEdge extends TypedEmitter<PixiEdgeEvents> {
  isSelfLoop: boolean;
  isBilateral: boolean;
  edgeGfx: Container;
  edgeLabelGfx: Container;
  edgeArrowGfx: Container;
  edgePlaceholderGfx: Container;

  hovered: boolean = false;

  constructor(option: { selfLoop: boolean, bilateral: boolean }) {
    super();

    this.isSelfLoop = option.selfLoop;
    this.isBilateral = option.bilateral;
    this.edgeGfx = this.createEdge();
    this.edgeLabelGfx = this.createEdgeLabel();
    this.edgeArrowGfx = this.createEdgeArrow();
    this.edgePlaceholderGfx = new Container();
  }

  createEdge() {
    const edgeGfx = new Container();
    edgeGfx.interactive = true;
    edgeGfx.buttonMode = true;
    edgeGfx.on('mousemove', (event: InteractionEvent) => this.emit('mousemove', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mouseover', (event: InteractionEvent) => this.emit('mouseover', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mousedown', (event: InteractionEvent) => this.emit('mousedown', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    edgeGfx.on('rightclick', (event: InteractionEvent) => this.emit('rightclick', event.data.originalEvent as MouseEvent));
    createEdge(edgeGfx, this.isSelfLoop);
    return edgeGfx;
  }

  createEdgeLabel() {
    const edgeLabelGfx = new Container();
    edgeLabelGfx.interactive = true;
    edgeLabelGfx.buttonMode = true;
    edgeLabelGfx.on('mousemove', (event: InteractionEvent) => this.emit('mousemove', event.data.originalEvent as MouseEvent));
    edgeLabelGfx.on('mouseover', (event: InteractionEvent) => this.emit('mouseover', event.data.originalEvent as MouseEvent));
    edgeLabelGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    edgeLabelGfx.on('mousedown', (event: InteractionEvent) => this.emit('mousedown', event.data.originalEvent as MouseEvent));
    edgeLabelGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    edgeLabelGfx.on('rightclick', (event: InteractionEvent) => this.emit('rightclick', event.data.originalEvent as MouseEvent));
    createEdgeLabel(edgeLabelGfx);
    return edgeLabelGfx;
  }

  createEdgeArrow() {
    const edgeArrowGfx = new Container();
    edgeArrowGfx.interactive = true;
    edgeArrowGfx.buttonMode = true;
    edgeArrowGfx.on('mousemove', (event: InteractionEvent) => this.emit('mousemove', event.data.originalEvent as MouseEvent));
    edgeArrowGfx.on('mouseover', (event: InteractionEvent) => this.emit('mouseover', event.data.originalEvent as MouseEvent));
    edgeArrowGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    edgeArrowGfx.on('mousedown', (event: InteractionEvent) => this.emit('mousedown', event.data.originalEvent as MouseEvent));
    edgeArrowGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    edgeArrowGfx.on('rightclick', (event: InteractionEvent) => this.emit('rightclick', event.data.originalEvent as MouseEvent));
    createEdgeArrow(edgeArrowGfx, this.isSelfLoop);
    return edgeArrowGfx;
  }

  updatePosition(sourceNodePosition: IPointData, targetNodePosition: IPointData, edgeStyle: EdgeStyle, sourceNodeStyle: NodeStyle, targetNodeStyle: NodeStyle) {
    if (this.isSelfLoop) {
      // 无自循环
      // const radius = targetNodeStyle.radius + targetNodeStyle.border.width;
      // const selefLoopRadius = edgeStyle.selefLoop.radius;
      // const selefLoopCross = edgeStyle.selefLoop.cross;
      // const tangentcircles = { x: targetNodePosition.x, y: targetNodePosition.y - radius - selefLoopRadius };
      // // edge
      // this.edgeGfx.position.copyFrom({ x: tangentcircles.x, y: tangentcircles.y + selefLoopCross });
      // // edge -> label
      // this.edgeLabelGfx.position.copyFrom({ x: tangentcircles.x, y: tangentcircles.y + selefLoopCross - this.edgeLabelGfx.height / 2 });
    } else {
      let targetX = targetNodePosition.x;
      let sourceX = sourceNodePosition.x;
      let targetY = targetNodePosition.y;
      let sourceY = sourceNodePosition.y;
      // 非通用方式，仅对当前项目定制
      if (edgeStyle.side == 'right') {
        // 右侧树
        let attachWidth = sourceNodeStyle.attach.show ? sourceNodeStyle.attach.iconWidth : 0; // 是否有按钮宽度，有则加上按钮宽度
        sourceX = sourceNodePosition.x + sourceNodeStyle.width / 2 + attachWidth + sourceNodeStyle.border.width; // sourceNodeStyle.border.width 为根节点边框宽度，一刀切方便些。。。
        targetX = targetNodePosition.x - targetNodeStyle.width / 2;
      } else {
        // 左侧树
        let attachWidth = targetNodeStyle.attach.show ? targetNodeStyle.attach.iconWidth : 0; // 是否有按钮宽度，有则加上按钮宽度
        sourceX = sourceNodePosition.x + sourceNodeStyle.width / 2;
        targetX = targetNodePosition.x - targetNodeStyle.width / 2 - attachWidth - targetNodeStyle.border.width; // targetNodeStyle.border.width 为根节点边框宽度，一刀切方便些。。。
      }

      const rotation = -Math.atan2(targetX - sourceX, targetY - sourceY);
      const link_length = Math.hypot(targetX - sourceX, targetY - sourceY);
      const position = { x: targetX + Math.sin(rotation) * (link_length / 2), y: targetY - Math.cos(rotation) * (link_length / 2) };
      // edge
      this.edgeGfx.position.copyFrom(position);
      this.edgeGfx.rotation = rotation;
      this.edgeGfx.height = link_length;
      // edge -> arrow
      const radius = Math.sqrt(3) / 4 * edgeStyle.arrow.size;
      const phi = Math.atan2(targetY - sourceY, targetX - sourceX);
      const arrowPosition = { x: targetX - Math.cos(phi) * radius, y: targetY - Math.sin(phi) * radius };
      this.edgeArrowGfx.position.copyFrom(arrowPosition);
      this.edgeArrowGfx.rotation = phi + Math.PI / 2;
    }
  }

  updateStyle(edgeStyle: EdgeStyle, textureCache: TextureCache) {
    updateEdgeStyle(this.edgeGfx, edgeStyle, textureCache, this.isSelfLoop);
    updateEdgeArrowStyle(this.edgeArrowGfx, edgeStyle, textureCache, this.isSelfLoop);
    updateEdgeLabelStyle(this.edgeLabelGfx, edgeStyle, textureCache);
  }

  updateVisibility(zoomStep: number) {
    updateEdgeVisibility(this.edgeGfx, zoomStep, this.isSelfLoop);
    updateEdgeLabelVisibility(this.edgeLabelGfx, zoomStep);
    updateEdgeArrowVisibility(this.edgeArrowGfx, zoomStep, this.isSelfLoop);
  }

  edgeVisibility(visible: boolean) {
    this.edgeGfx.visible = visible;
    this.edgeLabelGfx.visible = visible;
    this.edgeArrowGfx.visible = visible;
  }

  checkEdgeVisibility() {
    return this.edgeGfx.visible; // 注意文字和箭头容器的可见性
  }
}