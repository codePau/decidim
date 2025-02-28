# frozen_string_literal: true

require "spec_helper"

module Decidim
  module Amendable
    describe AmendmentAcceptedEvent do
      let!(:component) { create(:proposal_component) }
      let!(:amendable) { create(:proposal, component: component, title: amendable_title) }
      let!(:emendation) { create(:proposal, component: component, title: "My super emendation") }
      let!(:amendment) { create :amendment, amendable: amendable, emendation: emendation }
      let(:amendable_title) { "My super proposal" }

      include_examples "amendment accepted event"
    end
  end
end
