import LeadSummaryCards from "./LeadSummaryCards";

interface Props {

  totalLeads: number;

  hotLeads: number;

  todayFollowups: number;

  expectedValue: number;

  overdueLeads: number;

  upcomingLeads: number;

}

export default function LeadStats({

  totalLeads,

  hotLeads,

  todayFollowups,

  expectedValue,

  overdueLeads,

  upcomingLeads,

}: Props) {

  return (

    <LeadSummaryCards

      totalLeads={totalLeads}

      hotLeads={hotLeads}

      todayFollowups={todayFollowups}

      expectedValue={expectedValue}

      overdueLeads={overdueLeads}

      upcomingLeads={upcomingLeads}

    />

  );

}