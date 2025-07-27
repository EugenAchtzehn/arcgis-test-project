import DashboardView from '../DashboardView.vue'
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('DashboardView', () => {
  it('renders properly', () => {
    const wrapper = mount(DashboardView)
    // expect(wrapper.text()).toContain('This is the dashboard page')
    // await incrementBtn.trigger('click')

    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('This is the dashboard page')
  })
})
